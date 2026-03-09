#!/usr/bin/env node
/**
 * Converts existing HTML blog posts to MDX with frontmatter.
 * Extracts: title, description, category, date, etc. from HTML meta/structured data.
 * Extracts: post body HTML content between <div class="post-body"> and its closing tag.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, basename } from 'path';

const BLOG_DIR = join(import.meta.dirname, '..', 'blog');
const OUTPUT_DIR = join(import.meta.dirname, 'src', 'content', 'blog');

// Mapping from blog.html to get the card descriptions and cover images
const blogHtml = readFileSync(join(import.meta.dirname, '..', 'blog.html'), 'utf-8');

function extractMeta(html, attr, name) {
    const patterns = [
        new RegExp(`<meta\\s+${attr}=["']${name}["']\\s+content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+${attr}=["']${name}["']`, 'i'),
        // Multi-line: meta with content on next line
        new RegExp(`<meta\\s+${attr}=["']${name}["']\\s*\\n\\s*content=["']([^"']*)["']`, 'i'),
    ];
    for (const re of patterns) {
        const m = html.match(re);
        if (m) return m[1];
    }
    return '';
}

function extractJsonLd(html, type) {
    const re = /<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = re.exec(html)) !== null) {
        try {
            const data = JSON.parse(match[1]);
            if (data['@type'] === type) return data;
        } catch { }
    }
    return null;
}

function extractPostBody(html) {
    // Find the post-body div and extract its innerHTML
    const startMarker = '<div class="post-body">';
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) return '';

    const contentStart = startIdx + startMarker.length;

    // Find the matching closing div by counting depth
    let depth = 1;
    let i = contentStart;
    while (i < html.length && depth > 0) {
        if (html.substring(i).startsWith('<div')) depth++;
        else if (html.substring(i).startsWith('</div>')) depth--;
        if (depth > 0) i++;
        else break;
    }

    let body = html.substring(contentStart, i).trim();

    // Strip leading whitespace from each line so Markdown doesn't treat indented HTML as code blocks
    body = body.split('\n').map(line => line.replace(/^\s{4,}/, '')).join('\n');

    // Remove all blog-post-cta blocks (layout adds its own)
    body = body.replace(/<!--[^>]*CTA[^>]*-->\s*/gi, '');
    body = body.replace(/<div class="blog-post-cta[\s\S]*?<\/div>\s*<\/div>/g, '');

    // Remove Related Articles section (handled in frontmatter now)
    body = body.replace(/<div\s+style="margin-top: var\(--sp-2xl\)[\s\S]*?<\/ul>\s*<\/div>/g, '');

    // Fix image paths: ../../assets/ -> /assets/, ../slug/assets/ -> /blog/slug/assets/
    body = body.replace(/src="\.\.\/\.\.\/assets\//g, 'src="/assets/');
    body = body.replace(/src="\.\.\/([^"]+)\/assets\//g, 'src="/blog/$1/assets/');
    body = body.replace(/src="assets\//g, (match) => {
        return match; // Relative to own dir, will fix per-slug
    });
    body = body.replace(/href="\.\.\/\.\.\/index\.html"/g, 'href="/"');
    body = body.replace(/href="\.\.\/\.\.\/blog\.html"/g, 'href="/blog"');
    body = body.replace(/href="\.\.\/([^"]+)\/index\.html"/g, 'href="/blog/$1"');
    body = body.replace(/href="\.\.\/\.\.\/([^"]+)\.html"/g, 'href="/$1"');

    return body;
}

function getCardDescription(slug) {
    // Find the card entry in blog.html for this slug
    const re = new RegExp(`href="blog/${slug}/index\\.html"[\\s\\S]*?<p>([\\s\\S]*?)</p>`, 'i');
    const m = blogHtml.match(re);
    if (m) return m[1].trim().replace(/\s+/g, ' ');
    return '';
}

function getCardCoverImage(slug) {
    // Look for img src in the card for this slug in blog.html
    const cardRe = new RegExp(`href="blog/${slug}/index\\.html"[\\s\\S]*?<img[^>]+src="([^"]+)"`, 'i');
    const m = blogHtml.match(cardRe);
    if (m) {
        let src = m[1];
        // Normalize path
        if (src.startsWith('blog/')) src = '/' + src;
        if (src.startsWith('assets/')) src = '/' + src;
        return src;
    }
    return '';
}

function getCardCoverAlt(slug) {
    const cardRe = new RegExp(`href="blog/${slug}/index\\.html"[\\s\\S]*?<img[^>]+alt="([^"]*)"`, 'i');
    const m = blogHtml.match(cardRe);
    return m ? m[1] : '';
}

function extractRelatedPosts(html) {
    const related = [];
    const re = /href="\.\.\/([^"]+)\/index\.html"[^>]*>\s*(?:<svg[\s\S]*?<\/svg>\s*)?([\s\S]*?)<\/a>/gi;
    // Only look in the related articles section
    const relSection = html.match(/<h3[^>]*>[\s\S]*?Related Articles[\s\S]*?<\/ul>/i);
    if (!relSection) return [];

    let match;
    while ((match = re.exec(relSection[0])) !== null) {
        const slug = match[1];
        const title = match[2].trim().replace(/\s+/g, ' ');
        if (slug && title) {
            related.push({ slug, title });
        }
    }
    return related;
}

function extractFaq(html) {
    const faqData = extractJsonLd(html, 'FAQPage');
    if (!faqData || !faqData.mainEntity) return undefined;
    return faqData.mainEntity.map(q => ({
        question: q.name,
        answer: q.acceptedAnswer?.text || '',
    }));
}

// Process each blog post
const slugs = readdirSync(BLOG_DIR).filter(f => {
    return existsSync(join(BLOG_DIR, f, 'index.html'));
});

console.log(`Found ${slugs.length} blog posts to convert`);

for (const slug of slugs) {
    const htmlPath = join(BLOG_DIR, slug, 'index.html');
    const html = readFileSync(htmlPath, 'utf-8');

    // Extract metadata
    const title = (html.match(/<h1[^>]*class="post-title"[^>]*>([\s\S]*?)<\/h1>/i) || ['', ''])[1].trim();
    const description = extractMeta(html, 'name', 'description');
    const ogImage = extractMeta(html, 'property', 'og:image') || `https://gainframe.app/blog/${slug}/assets/cover.webp`;
    const keywords = extractMeta(html, 'name', 'keywords');

    // From structured data
    const blogPosting = extractJsonLd(html, 'BlogPosting');
    const category = blogPosting?.articleSection || 'Guide';
    const date = blogPosting?.datePublished || '2026-02-22';
    const dateModified = blogPosting?.dateModified;

    // From post header
    const readTimeMatch = html.match(/<span class="post-read-time">([\s\S]*?)<\/span>/i);
    const readTime = readTimeMatch ? readTimeMatch[1].trim() : '5 min read';

    const subtitleMatch = html.match(/<p class="post-subtitle">([\s\S]*?)<\/p>/i);
    const subtitle = subtitleMatch ? subtitleMatch[1].trim().replace(/\s+/g, ' ') : '';

    // Card info from blog.html
    const cardDescription = getCardDescription(slug) || description;
    const coverImage = getCardCoverImage(slug) || `/blog/${slug}/assets/cover.webp`;
    const coverAlt = getCardCoverAlt(slug) || title;

    // Related posts
    const relatedPosts = extractRelatedPosts(html);

    // FAQ
    const faq = extractFaq(html);

    // Post body content  
    let body = extractPostBody(html);
    // Fix relative asset paths for this specific slug
    body = body.replace(/src="assets\//g, `src="/blog/${slug}/assets/`);

    // Build frontmatter
    const frontmatter = {
        title: title.replace(/&amp;/g, '&'),
        description: cardDescription.replace(/&amp;/g, '&').replace(/\n/g, ' '),
        category,
        date: date,
        ...(dateModified && dateModified !== date ? { dateModified } : {}),
        ogImage,
        coverImage,
        coverAlt,
        readTime,
        subtitle: subtitle.replace(/\n/g, ' ').replace(/&amp;/g, '&'),
        ...(keywords ? { keywords } : {}),
        ...(faq && faq.length > 0 ? { faq } : {}),
        ...(relatedPosts.length > 0 ? { relatedPosts } : {}),
    };

    // Write MDX
    const yaml = buildYaml(frontmatter);
    const mdxContent = `---\n${yaml}---\n\n${body}\n`;

    const outPath = join(OUTPUT_DIR, `${slug}.md`);
    writeFileSync(outPath, mdxContent);

    // Copy assets to public directory
    const sourceAssetsDir = join(BLOG_DIR, slug, 'assets');
    const destAssetsDir = join(process.cwd(), 'public', 'blog', slug, 'assets');

    if (existsSync(sourceAssetsDir)) {
        if (!existsSync(destAssetsDir)) {
            mkdirSync(destAssetsDir, { recursive: true });
        }

        const assets = readdirSync(sourceAssetsDir);
        for (const asset of assets) {
            copyFileSync(join(sourceAssetsDir, asset), join(destAssetsDir, asset));
        }
    }

    console.log(`✓ ${slug}`);
}

function buildYaml(obj, indent = 0) {
    let yaml = '';
    const pad = '  '.repeat(indent);
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
            yaml += `${pad}${key}:\n`;
            for (const item of value) {
                if (typeof item === 'object') {
                    const entries = Object.entries(item);
                    yaml += `${pad}  - ${entries[0][0]}: ${yamlStr(entries[0][1])}\n`;
                    for (let i = 1; i < entries.length; i++) {
                        yaml += `${pad}    ${entries[i][0]}: ${yamlStr(entries[i][1])}\n`;
                    }
                } else {
                    yaml += `${pad}  - ${yamlStr(item)}\n`;
                }
            }
        } else if (typeof value === 'object') {
            yaml += `${pad}${key}:\n`;
            yaml += buildYaml(value, indent + 1);
        } else {
            yaml += `${pad}${key}: ${yamlStr(value)}\n`;
        }
    }
    return yaml;
}

function yamlStr(val) {
    if (typeof val !== 'string') return String(val);
    // Always quote date-like strings and strings with special chars
    if (/^\d{4}-\d{2}-\d{2}/.test(val) || val.includes(':') || val.includes('#') || val.includes("'") || val.includes('"') || val.includes('\n') || val.includes('&') || val.includes('—') || val.includes('$') || val.includes('%') || val.includes('{') || val.includes('[') || val.startsWith(' ') || val.startsWith('@')) {
        // Use double quotes, escape internal double quotes
        return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return val;
}

console.log('\nDone! All posts converted to MDX.');

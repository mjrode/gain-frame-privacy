import os
import glob
import re
import shutil

ROOT_DIR = "/Users/michael.rode/code/project/gain-frame-privacy"
BLOG_DIR = os.path.join(ROOT_DIR, "blog")
ASSETS_DIR = os.path.join(ROOT_DIR, "assets")
ARCHIVE_DIR = os.path.join(ROOT_DIR, "archived")

def copy_asset_and_update_path(match):
    full_path = match.group(0)
    asset_subpath = match.group(1) # e.g. "GF-Promo/smart-compare-options.PNG"
    
    # We want to keep favicon pointing to the global one
    if "favicon.png" in asset_subpath:
        return f'src="../../assets/{asset_subpath}"'
        
    source_asset = os.path.join(ASSETS_DIR, asset_subpath)
    file_name = os.path.basename(asset_subpath)
    
    if os.path.exists(source_asset):
        dest_asset = os.path.join(current_blog_assets_dir, file_name)
        shutil.copy2(source_asset, dest_asset)
    
    return f'src="assets/{file_name}"'

def update_og_image(match):
    # content="https://gainframe.app/assets/deep-dive-compare.PNG"
    asset_subpath = match.group(1)
    file_name = os.path.basename(asset_subpath)
    # The image should have been copied by the src replacer (or we just assume it is)
    return f'content="https://gainframe.app/blog/{current_blog_name}/assets/{file_name}"'

# 1. Process all flat HTML files in /blog
flat_htmls = [f for f in glob.glob(os.path.join(BLOG_DIR, "*.html"))]

print("Restructuring blog posts...")
for html_path in flat_htmls:
    print(f"Processing {html_path}")
    name = os.path.basename(html_path).replace(".html", "")
    content = open(html_path, "r").read()
    
    # Create directory structure
    new_dir = os.path.join(BLOG_DIR, name)
    global current_blog_assets_dir, current_blog_name
    current_blog_name = name
    current_blog_assets_dir = os.path.join(new_dir, "assets")
    os.makedirs(current_blog_assets_dir, exist_ok=True)
    
    # Update image sources and copy assets
    content = re.sub(r'src="\.\./assets/([^"]+)"', copy_asset_and_update_path, content)
    content = re.sub(r'content="https://gainframe.app/assets/([^"]+)"', update_og_image, content)
    
    # Update other relative links
    content = content.replace('href="../styles.css"', 'href="../../styles.css"')
    content = content.replace('href="../index.html"', 'href="../../index.html"')
    content = content.replace('href="../blog.html"', 'href="../../blog.html"')
    content = content.replace('href="../assets/favicon.png"', 'href="../../assets/favicon.png"')
    
    # Links to other blog posts: href="timeline-tracking-guide.html" -> href="../timeline-tracking-guide/index.html"
    for other_html in flat_htmls:
        other_name = os.path.basename(other_html)
        other_dir_name = other_name.replace(".html", "")
        content = content.replace(f'href="{other_name}"', f'href="../{other_dir_name}/index.html"')
    
    # Special case, if there was an absolute link to another blog post
    for other_html in flat_htmls:
        other_name = os.path.basename(other_html)
        other_dir_name = other_name.replace(".html", "")
        content = content.replace(f'https://gainframe.app/blog/{other_name}', f'https://gainframe.app/blog/{other_dir_name}/index.html')

    # Save to new index.html
    new_index_path = os.path.join(new_dir, "index.html")
    with open(new_index_path, "w") as f:
        f.write(content)
        
    # Remove the flat file
    os.remove(html_path)

print("Restructure complete!")

# 2. Update global files (index.html, blog.html, sitemap.xml)
print("Updating root html files...")
global_files = [
    os.path.join(ROOT_DIR, "index.html"),
    os.path.join(ROOT_DIR, "blog.html"),
    os.path.join(ROOT_DIR, "sitemap.xml")
]

flat_names = [os.path.basename(f).replace(".html", "") for f in flat_htmls]

for path in global_files:
    if os.path.exists(path):
        content = open(path, "r").read()
        for name in flat_names:
            content = content.replace(f'blog/{name}.html', f'blog/{name}/index.html')
            content = content.replace(f'blog/{name}', f'blog/{name}') # careful not to double replace. The first replace will do the trick if the .html is present.
            
        with open(path, "w") as f:
            f.write(content)


# 3. Archive unused assets
print("Archiving unused assets...")
os.makedirs(ARCHIVE_DIR, exist_ok=True)

# Let's get every file name in assets and subdirectories
all_assets = []
for root, _, files in os.walk(ASSETS_DIR):
    for file in files:
        if file.startswith('.'): continue
        all_assets.append(os.path.join(root, file))

# We will read all html/css/js files to see if the filename exists anywhere
text_contents = []
for root, _, files in os.walk(ROOT_DIR):
    if ARCHIVE_DIR in root: continue
    for file in files:
        if file.endswith((".html", ".css", ".js", ".xml")):
            path = os.path.join(root, file)
            text_contents.append(open(path, "r", encoding='utf-8', errors='ignore').read())

full_text = " ".join(text_contents)

archived_count = 0
for asset_path in all_assets:
    file_name = os.path.basename(asset_path).split("?")[0] # clean up just in case
    # we just string check if file_name is in full_text
    
    # Special cases: we shouldn't archive favicon.png because it's widely used
    if file_name == "favicon.png" or file_name == "logo.png":
        continue
        
    if file_name not in full_text:
        # Before moving, recreate structure in archive
        rel_path = os.path.relpath(asset_path, ASSETS_DIR)
        dest_path = os.path.join(ARCHIVE_DIR, rel_path)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.move(asset_path, dest_path)
        archived_count += 1
        
print(f"Archived {archived_count} unused assets.")

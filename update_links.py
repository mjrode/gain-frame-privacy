import os
import re

directory = "/Users/michael.rode/code/project/gain-frame-privacy"

badge_html = '''<a href="https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082" class="app-store-badge-link" target="_blank" rel="noopener">
                        <img src="https://developer.apple.com/news/images/download-on-the-app-store-badge.png" alt="Download on the App Store" style="height: 48px; width: auto;" />
                    </a>'''

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # 1. replace email capture block everywhere
    content = re.sub(
        r'<div class="email-capture".*?<form class="email-capture-form".*?</form>\s*<p class="email-capture-privacy">.*?</p>\s*</div>',
        f'<div class="app-store-wrapper" style="margin-top: 1rem; display: flex; justify-content: center;">\n                        {badge_html}\n                    </div>',
        content,
        flags=re.DOTALL
    )
    
    content = re.sub(
        r'<div class="email-capture".*?<form class="email-capture-form".*?</form>\s*</div>',
        f'<div class="app-store-wrapper" style="margin-top: 1rem; display: flex; justify-content: center;">\n                        {badge_html}\n                    </div>',
        content,
        flags=re.DOTALL
    )

    # 2. General replacement of words
    content = re.sub(
        r'GainFrame is launching soon\.',
        'GainFrame is now available.',
        content
    )
    content = re.sub(
        r'Sign up for early access and be the first to know when we go live\.',
        'Download now from the App Store and start tracking your true progress.',
        content
    )
    content = re.sub(
        r'Sign up to get notified at launch\.',
        'Download now from the App Store.',
        content
    )
    content = re.sub(
        r'Get notified at launch',
        'Download GainFrame today',
        content
    )
    content = re.sub(
        r'<h2>GainFrame is launching soon</h2>',
        '<h2>GainFrame is now available</h2>',
        content
    )

    # 3. Handle GA4 Tracker removal if necessary
    content = re.sub(
        r'<!-- GA4 Waitlist Conversion Tracker -->.*?</script>',
        '',
        content,
        flags=re.DOTALL
    )

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(directory):
    for filename in files:
        if filename.endswith(".html"):
            process_file(os.path.join(root, filename))

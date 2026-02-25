import os
import glob

# The injection snippet
SCRIPT_INJECTION = """
    <!-- GA4 Waitlist Conversion Tracker -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var forms = document.querySelectorAll('.email-capture-form');
            forms.forEach(function(form) {
                form.addEventListener('submit', function() {
                    if (typeof gtag === 'function') {
                        gtag('event', 'waitlist_joined', {
                            'event_category': 'engagement',
                            'event_label': 'beta_signup',
                            'page_location': window.location.href,
                            'utm_source': document.querySelector('.utm-source') ? document.querySelector('.utm-source').value : '',
                            'utm_medium': document.querySelector('.utm-medium') ? document.querySelector('.utm-medium').value : '',
                            'utm_campaign': document.querySelector('.utm-campaign') ? document.querySelector('.utm-campaign').value : ''
                        });
                    }
                });
            });
        });
    </script>
</body>"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Avoid injecting multiple times if we run script again
    if 'waitlist_joined' in content:
        print(f"Skipping {filepath} (Already injected)")
        return
        
    # Replace the closing body tag
    if '</body>' in content:
        content = content.replace('</body>', SCRIPT_INJECTION)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected into {filepath}")
    else:
        print(f"Warning: No </body> found in {filepath}")

# Process root HTML files
root_htmls = glob.glob('*.html')
for html in root_htmls:
    process_file(html)

# Process blog HTML files
blog_htmls = glob.glob('blog/*/index.html')
for html in blog_htmls:
    process_file(html)

print("Injection complete.")

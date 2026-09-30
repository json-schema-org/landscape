if [ -f "build/index.html" ]; then
  python3 << 'EOF'
with open('build/index.html', 'r') as f:
    content = f.read()

script = '''
<script>
(function() {
  function scrollToTop() {
    window.addEventListener('click', function(e) {
      const btn = e.target.closest('button[aria-label="Scroll to top"]');
      if (!btn) return;
      e.stopImmediatePropagation();
      e.preventDefault();

      const scrollContainer = [...document.querySelectorAll('*')].find(el => {
        const s = getComputedStyle(el);
        return el.scrollTop > 0 || 
          ((s.overflow === 'auto' || s.overflow === 'scroll' || 
            s.overflowY === 'auto' || s.overflowY === 'scroll') && 
            el.scrollHeight > el.clientHeight && !el.className);
      });

      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollToTop);
  } else {
    scrollToTop();
  }
})();
</script>
'''

if '</body>' in content:
    content = content.replace('</body>', script + '\n</body>')
    with open('build/index.html', 'w') as f:
        f.write(content)
    print("Smooth scroll script injected successfully")
else:
    print("Warning: </body> tag not found in index.html")
EOF
fi


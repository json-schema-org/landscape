
set -e

landscape2 build \
  --data-file landscape.yml \
  --settings-file settings.yml \
  --guide-file guide.yml \
  --logos-path logos \
  --output-dir build

python3 - <<'PYEOF'
content = open('build/index.html', 'r').read()
script = (
  '<script>'
  'var _obs=new MutationObserver(function(){'
  'document.querySelectorAll("a[href]").forEach(function(a){'
  'if(a.href&&!a.href.startsWith("javascript")&&a.getAttribute("target")!=="blank"){'
  'a.setAttribute("target","_blank");'
  'a.setAttribute("rel","noopener noreferrer");'
  '}'
  '});'
  '});'
  '_obs.observe(document.body,{childList:true,subtree:true});'
  '</script>'
)
# Remove old injection if present, then re-inject cleanly
content = content.replace(script, '')
content = content.replace('</body>', script + '</body>')
open('build/index.html', 'w').write(content)
print('Guide links patched — all links will open in a new tab.')
PYEOF

echo ""
echo "✅ Done! Run: landscape2 serve --landscape-dir build"

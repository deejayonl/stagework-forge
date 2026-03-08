export const injectEditorScript = (htmlContent: string): string => {
  const script = `
    <script>
      (function() {
        let selectedElement = null;
        let hoverElement = null;
        
        // Highlight styles
        const highlightBox = document.createElement('div');
        highlightBox.style.position = 'absolute';
        highlightBox.style.pointerEvents = 'none';
        highlightBox.style.border = '2px solid #3b82f6';
        highlightBox.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        highlightBox.style.zIndex = '10000';
        highlightBox.style.transition = 'all 0.1s ease';
        highlightBox.style.display = 'none';
        document.body.appendChild(highlightBox);

        const hoverBox = document.createElement('div');
        hoverBox.style.position = 'absolute';
        hoverBox.style.pointerEvents = 'none';
        hoverBox.style.border = '1px dashed #9ca3af';
        hoverBox.style.backgroundColor = 'rgba(156, 163, 175, 0.1)';
        hoverBox.style.zIndex = '9999';
        hoverBox.style.transition = 'all 0.1s ease';
        hoverBox.style.display = 'none';
        document.body.appendChild(hoverBox);

        // Animate on scroll logic for preview
        const scrollStyle = document.createElement('style');
        scrollStyle.id = 'forge-scroll-styles-preview';
        scrollStyle.textContent = '.animate-on-scroll { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; } .animate-on-scroll.is-visible { opacity: 1; transform: translateY(0); }';
        document.head.appendChild(scrollStyle);

        const scrollObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            } else {
              // For preview, we might want to un-animate so they can test it again
              entry.target.classList.remove('is-visible');
            }
          });
        });

        const observeScrollElements = () => {
          document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));
        };
        observeScrollElements();
        
        // Re-observe when DOM updates
        const domObserver = new MutationObserver(() => observeScrollElements());
        domObserver.observe(document.body, { childList: true, subtree: true });

        function updateBox(box, el) {
          if (!el) {
            box.style.display = 'none';
            return;
          }
          const rect = el.getBoundingClientRect();
          box.style.top = (rect.top + window.scrollY) + 'px';
          box.style.left = (rect.left + window.scrollX) + 'px';
          box.style.width = rect.width + 'px';
          box.style.height = rect.height + 'px';
          box.style.display = 'block';
        }

        function getElementPath(el) {
          const path = [];
          let current = el;
          while (current && current !== document.body && current !== document.documentElement) {
            let index = 0;
            let sibling = current.previousElementSibling;
            while (sibling) {
              index++;
              sibling = sibling.previousElementSibling;
            }
            path.unshift(index);
            current = current.parentElement;
          }
          return path;
        }
        
        function buildDOMTree(el) {
          if (!el || el === highlightBox || el === hoverBox) return null;
          if (el.nodeType === Node.TEXT_NODE) {
            if (!el.textContent.trim()) return null;
            return { type: 'text', content: el.textContent.trim() };
          }
          if (el.nodeType !== Node.ELEMENT_NODE) return null;
          
          const children = [];
          for (let i = 0; i < el.childNodes.length; i++) {
            const childNode = buildDOMTree(el.childNodes[i]);
            if (childNode) children.push(childNode);
          }
          
          // Generate a unique ID if none exists
          if (!el.dataset.forgeId) {
            el.dataset.forgeId = 'node-' + Math.random().toString(36).substr(2, 9);
          }
          
          return {
            id: el.dataset.forgeId,
            tagName: el.tagName.toLowerCase(),
            className: el.className,
            children,
            path: getElementPath(el)
          };
        }

        function sendDOMUpdate() {
           const tree = buildDOMTree(document.body);
           window.parent.postMessage({ type: 'FORGE_DOM_TREE', tree }, '*');
        }

        document.addEventListener('mouseover', (e) => {
          if (e.target === document.body || e.target === document.documentElement) return;
          hoverElement = e.target;
          updateBox(hoverBox, hoverElement);
        });

        document.addEventListener('mouseout', () => {
          hoverElement = null;
          updateBox(hoverBox, null);
        });

        const executeAction = (actionStr) => {
          if (!actionStr) return;
          const [action, ...args] = actionStr.split(':');
          
          if (action === 'alert') {
            alert(args.join(':'));
          } else if (action === 'navigate') {
            window.parent.postMessage({
              type: 'FORGE_EXECUTE_ACTION',
              action,
              target: args[0]
            }, '*');
          } else if (action === 'setVariable' || action === 'toggleVariable') {
            window.parent.postMessage({
              type: 'FORGE_EXECUTE_ACTION',
              action,
              key: args[0],
              value: args.slice(1).join(':')
            }, '*');
          }
        };

        // Attach generic event listeners for actions
        ['change', 'submit', 'mouseenter', 'mouseleave'].forEach(evt => {
          document.addEventListener(evt, (e) => {
            const target = e.target;
            const actionStr = target.getAttribute(\`data-on-\${evt}\`);
            if (actionStr) {
              if (evt === 'submit') e.preventDefault();
              executeAction(actionStr);
            }
          }, true);
        });

        document.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          selectedElement = e.target;
          
          // Execute click action if present
          const actionStr = selectedElement.getAttribute('data-on-click');
          if (actionStr) {
            executeAction(actionStr);
          }
          
          updateBox(highlightBox, selectedElement);
          
          const computedStyle = window.getComputedStyle(selectedElement);
          
          // Generate a unique ID if none exists
          if (!selectedElement.dataset.forgeId) {
            selectedElement.dataset.forgeId = 'node-' + Math.random().toString(36).substr(2, 9);
          }
          
          window.parent.postMessage({
            type: 'FORGE_ELEMENT_SELECTED',
            element: {
              id: selectedElement.dataset.forgeId,
              tagName: selectedElement.tagName.toLowerCase(),
              className: selectedElement.className,
              path: getElementPath(selectedElement),
              attributes: Array.from(selectedElement.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {}),
              dataset: Object.keys(selectedElement.dataset).reduce((acc, key) => {
                acc[key] = selectedElement.dataset[key];
                return acc;
              }, {}),
              textContent: (selectedElement.childNodes.length === 1 && selectedElement.firstChild.nodeType === Node.TEXT_NODE) || selectedElement.childNodes.length === 0 || selectedElement.dataset.bindText
                ? selectedElement.textContent 
                : '',
              styles: {
                color: computedStyle.color,
                backgroundColor: computedStyle.backgroundColor,
                padding: computedStyle.padding,
                margin: computedStyle.margin,
                fontSize: computedStyle.fontSize,
                fontWeight: computedStyle.fontWeight,
                display: computedStyle.display,
                flexDirection: computedStyle.flexDirection,
                justifyContent: computedStyle.justifyContent,
                alignItems: computedStyle.alignItems,
                gap: computedStyle.gap
              }
            }
          }, '*');
        }, true);
        
        
        
        document.addEventListener('contextmenu', (e) => {
          if (e.target === document.body || e.target === document.documentElement) return;
          e.preventDefault();
          e.stopPropagation();
          
          selectedElement = e.target;
          
          updateBox(highlightBox, selectedElement);
          
          const computedStyle = window.getComputedStyle(selectedElement);
          
          if (!selectedElement.dataset.forgeId) {
            selectedElement.dataset.forgeId = 'node-' + Math.random().toString(36).substr(2, 9);
          }
          
          window.parent.postMessage({
            type: 'FORGE_CONTEXT_MENU',
            x: e.clientX,
            y: e.clientY,
            element: {
              id: selectedElement.dataset.forgeId,
              tagName: selectedElement.tagName.toLowerCase(),
              className: selectedElement.className,
              path: getElementPath(selectedElement),
              attributes: Array.from(selectedElement.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {}),
              dataset: Object.keys(selectedElement.dataset).reduce((acc, key) => {
                acc[key] = selectedElement.dataset[key];
                return acc;
              }, {}),
              textContent: (selectedElement.childNodes.length === 1 && selectedElement.firstChild.nodeType === Node.TEXT_NODE) || selectedElement.childNodes.length === 0 || selectedElement.dataset.bindText
                ? selectedElement.textContent 
                : '',
              outerHTML: selectedElement.outerHTML
            }
          }, '*');
        }, true);

        document.addEventListener('dblclick', (e) => {
          if (e.target === document.body || e.target === document.documentElement) return;
          
          const el = e.target;
          
          // Only allow editing if it mostly contains text
          if (el.childNodes.length === 1 && el.firstChild.nodeType === Node.TEXT_NODE) {
            e.preventDefault();
            e.stopPropagation();
            
            el.contentEditable = 'true';
            el.focus();
            
            // Highlight box might get in the way during editing, so hide it
            highlightBox.style.display = 'none';
            
            const finishEditing = () => {
              el.contentEditable = 'false';
              el.removeEventListener('blur', finishEditing);
              el.removeEventListener('keydown', handleKeyDown);
              
              updateBox(highlightBox, el);
              
              // Send the updated text to the parent
              if (el.dataset.forgeId) {
                window.parent.postMessage({
                  type: 'FORGE_TEXT_EDITED',
                  id: el.dataset.forgeId,
                  text: el.textContent
                }, '*');
                // Also trigger a DOM update
                sendDOMUpdate();
              }
            };
            
            const handleKeyDown = (evt) => {
              if (evt.key === 'Enter' && !evt.shiftKey) {
                evt.preventDefault();
                el.blur();
              } else if (evt.key === 'Escape') {
                evt.preventDefault();
                el.blur();
              }
            };
            
            el.addEventListener('blur', finishEditing);
            el.addEventListener('keydown', handleKeyDown);
          }
        }, true);

        document.addEventListener('keydown', (e) => {
          if (!selectedElement) return;
          
          // Don't trigger if we are editing text
          if (document.activeElement && document.activeElement.contentEditable === 'true') return;
          
          if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            const id = selectedElement.dataset.forgeId;
            if (id) {
              window.parent.postMessage({ type: 'FORGE_DELETE_ELEMENT', id }, '*');
            }
          } else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
            e.preventDefault();
            const id = selectedElement.dataset.forgeId;
            if (id) {
              window.parent.postMessage({ type: 'FORGE_DUPLICATE_ELEMENT', id }, '*');
            }
          }
        });

        // Drag and Drop Handling
        document.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.target !== document.body && e.target !== document.documentElement) {
            hoverElement = e.target;
            updateBox(hoverBox, hoverElement);
          }
        });

        document.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          hoverElement = null;
          updateBox(hoverBox, null);
          
          const html = e.dataTransfer.getData('text/html');
          const componentName = e.dataTransfer.getData('application/forge-component');
          
          if (html) {
            let target = e.target === document.documentElement ? document.body : e.target;
            
            // If dropping on a text node or similar, get parent
            if (target.nodeType === 3) target = target.parentNode;
            
            // Post message to parent to handle the insertion
            window.parent.postMessage({
              type: 'FORGE_INSERT_COMPONENT',
              html: html,
              componentName: componentName || null,
              targetId: target.dataset.forgeId || null
            }, '*');
          }
        });

        // Listen for messages from parent
        window.addEventListener('message', (e) => {
          if (e.data.type === 'FORGE_UPDATE_STYLE') {
            const { id, property, value, breakpoint, state } = e.data;
            const el = document.querySelector(\`[data-forge-id="\${id}"]\`);
            if (el) {
              const kebabProp = property.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
              if (state === 'hover') {
                let uniqueClass = Array.from(el.classList).find(c => c.startsWith('forge-hover-'));
                if (!uniqueClass) {
                  uniqueClass = 'forge-hover-' + Math.random().toString(36).substring(2, 9);
                  el.classList.add(uniqueClass);
                }
                let styleBlock = document.getElementById('forge-hover-styles');
                if (!styleBlock) {
                  styleBlock = document.createElement('style');
                  styleBlock.id = 'forge-hover-styles';
                  document.head.appendChild(styleBlock);
                }
                styleBlock.textContent += '\n.' + uniqueClass + ':hover { ' + kebabProp + ': ' + value + ' !important; }';
              } else if (!breakpoint || breakpoint === 'desktop') {
                el.style[property] = value;
              } else {
                let uniqueClass = Array.from(el.classList).find(c => c.startsWith('forge-resp-'));
                if (!uniqueClass) {
                  uniqueClass = 'forge-resp-' + Math.random().toString(36).substring(2, 9);
                  el.classList.add(uniqueClass);
                }
                let styleBlock = document.getElementById('forge-responsive-styles');
                if (!styleBlock) {
                  styleBlock = document.createElement('style');
                  styleBlock.id = 'forge-responsive-styles';
                  document.head.appendChild(styleBlock);
                }
                const mediaQuery = breakpoint === 'mobile' ? '@media (max-width: 767px)' : '@media (min-width: 768px) and (max-width: 1023px)';
                styleBlock.textContent += '\n' + mediaQuery + ' { .' + uniqueClass + ' { ' + kebabProp + ': ' + value + ' !important; } }';
              }
              updateBox(highlightBox, el);
            }
          } else if (e.data.type === 'FORGE_TOGGLE_CLASS') {
            const { id, className, toggle } = e.data;
            const el = document.querySelector(\`[data-forge-id="\${id}"]\`);
            if (el) {
              if (toggle) el.classList.add(className);
              else el.classList.remove(className);
              updateBox(highlightBox, el);
            }
          } else if (e.data.type === 'FORGE_UPDATE_THEME') {
            const theme = e.data.theme;
            if (!theme) return;
            
            // Generate Tailwind config override block
            let twConfigScript = document.getElementById('forge-tw-config');
            if (!twConfigScript) {
              twConfigScript = document.createElement('script');
              twConfigScript.id = 'forge-tw-config';
              document.head.appendChild(twConfigScript);
            }
            
            twConfigScript.textContent = \`
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      primary: '\${theme.primary || '#3b82f6'}',
                      secondary: '\${theme.secondary || '#64748b'}',
                      accent: '\${theme.accent || '#8b5cf6'}'
                    },
                    fontFamily: {
                      sans: ['"\${theme.fontFamily || 'Inter'}"', 'sans-serif']
                    }
                  }
                }
              }
            \`;

            // Inject Google Font
            if (theme.fontFamily) {
              let fontLink = document.getElementById('forge-google-font');
              if (!fontLink) {
                fontLink = document.createElement('link');
                fontLink.id = 'forge-google-font';
                fontLink.rel = 'stylesheet';
                document.head.appendChild(fontLink);
              }
              const formattedName = theme.fontFamily.replace(/ /g, '+');
              fontLink.href = \`https://fonts.googleapis.com/css2?family=\${formattedName}:wght@300;400;500;600;700&display=swap\`;
              
              // Apply globally
              document.body.style.fontFamily = \`"\${theme.fontFamily}", sans-serif\`;
            }
          } else if (e.data.type === 'FORGE_UPDATE_SEO') {
            const seo = e.data.seo;
            if (!seo) return;
            
            if (seo.title) {
              document.title = seo.title;
            }
            
            if (seo.description) {
              let metaDesc = document.querySelector('meta[name="description"]');
              if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
              }
              metaDesc.setAttribute('content', seo.description);
            }
            
            if (seo.ogImage) {
              let metaOgImage = document.querySelector('meta[property="og:image"]');
              if (!metaOgImage) {
                metaOgImage = document.createElement('meta');
                metaOgImage.setAttribute('property', 'og:image');
                document.head.appendChild(metaOgImage);
              }
              metaOgImage.setAttribute('content', seo.ogImage);
            }
          } else if (e.data.type === 'FORGE_UPDATE_VARIABLES') {
            const variables = e.data.variables;
            
            // Handle Conditional Visibility (data-if)
            document.querySelectorAll('[data-if]').forEach(el => {
              const conditionKey = el.getAttribute('data-if');
              const val = variables[conditionKey];
              // Assuming 'true', '1', or non-empty string is truthy (except 'false' or '0')
              const isTruthy = val !== undefined && val !== null && val !== 'false' && val !== '0' && val !== '';
              
              if (isTruthy) {
                el.style.display = el.dataset.originalDisplay || ''; // restore original
              } else {
                if (!el.dataset.originalDisplay && el.style.display !== 'none') {
                  el.dataset.originalDisplay = el.style.display;
                }
                el.style.display = 'none';
              }
            });

            // Handle List Renderings first
            document.querySelectorAll('[data-bind-list]').forEach(listEl => {
              const key = listEl.getAttribute('data-bind-list');
              let arrayData = [];
              try {
                if (variables[key]) {
                   arrayData = JSON.parse(variables[key]);
                   if (!Array.isArray(arrayData)) arrayData = [];
                }
              } catch(e) {
                // Not valid JSON, try comma separated
                if (variables[key]) arrayData = variables[key].split(',').map(s => s.trim());
              }

              // Save template if not already saved
              if (!listEl.hasAttribute('data-list-template')) {
                // If it has children, use the first child as template. If not, use innerHTML.
                const template = listEl.firstElementChild ? listEl.firstElementChild.outerHTML : listEl.innerHTML;
                listEl.setAttribute('data-list-template', encodeURIComponent(template));
              }

              const templateStr = decodeURIComponent(listEl.getAttribute('data-list-template'));
              
              if (arrayData.length > 0) {
                let newHtml = '';
                arrayData.forEach((item, index) => {
                  let itemStr = templateStr;
                  // Replace bindings within the template
                  // Simple replacement for text: {{item.name}} or {{item}}
                  // For data-bind-text="item.name"
                  // We can't easily parse DOM here without creating a temp div
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = itemStr;
                  
                  // Text bindings
                  tempDiv.querySelectorAll('[data-bind-text]').forEach(el => {
                    const bindKey = el.getAttribute('data-bind-text');
                    if (bindKey.startsWith('item.')) {
                      const prop = bindKey.split('.')[1];
                      if (item && item[prop] !== undefined) el.textContent = item[prop];
                    } else if (bindKey === 'item') {
                      el.textContent = typeof item === 'object' ? JSON.stringify(item) : item;
                    } else if (variables[bindKey] !== undefined) {
                      el.textContent = variables[bindKey];
                    }
                  });

                  // Src bindings
                  tempDiv.querySelectorAll('[data-bind-src]').forEach(el => {
                    const bindKey = el.getAttribute('data-bind-src');
                    if (bindKey.startsWith('item.')) {
                      const prop = bindKey.split('.')[1];
                      if (item && item[prop] !== undefined) el.setAttribute('src', item[prop]);
                    } else if (bindKey === 'item') {
                      if (typeof item === 'string') el.setAttribute('src', item);
                    } else if (variables[bindKey] !== undefined) {
                      el.setAttribute('src', variables[bindKey]);
                    }
                  });

                  newHtml += tempDiv.innerHTML;
                });
                listEl.innerHTML = newHtml;
              }
            });

            // Handle Standard Bindings (outside lists)
            document.querySelectorAll('[data-bind-text]').forEach(el => {
              // Skip if inside a list (already handled)
              if (el.closest('[data-bind-list]') && el.closest('[data-bind-list]') !== el) return;
              const key = el.getAttribute('data-bind-text');
              if (variables[key] !== undefined) {
                el.textContent = variables[key];
              }
            });
            document.querySelectorAll('[data-bind-src]').forEach(el => {
              if (el.closest('[data-bind-list]') && el.closest('[data-bind-list]') !== el) return;
              const key = el.getAttribute('data-bind-src');
              if (variables[key] !== undefined) {
                el.setAttribute('src', variables[key]);
              }
            });
          } else if (e.data.type === 'FORGE_UPDATE_TEXT') {
            const { id, text } = e.data;
            const el = document.querySelector(\`[data-forge-id="\${id}"]\`);
            if (el) {
              el.textContent = text;
              updateBox(highlightBox, el);
            }
          } else if (e.data.type === 'FORGE_UPDATE_SRC') {
            const { id, url } = e.data;
            const el = document.querySelector(\`[data-forge-id="\${id}"]\`);
            if (el) {
              el.setAttribute('src', url);
              updateBox(highlightBox, el);
            }
          } else if (e.data.type === 'FORGE_SELECT_NODE') {
            const { id } = e.data;
            const el = document.querySelector(\`[data-forge-id="\${id}"]\`);
            if (el) {
              selectedElement = el;
              updateBox(highlightBox, el);
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else if (e.data.type === 'FORGE_HOVER_NODE') {
            const { id } = e.data;
            if (!id) {
              hoverBox.style.display = 'none';
              return;
            }
            const el = document.querySelector(\`[data-forge-id="\${id}"]\`);
            if (el) {
              updateBox(hoverBox, el);
            } else {
              hoverBox.style.display = 'none';
            }
          }
        });

        // Initial DOM tree sent after a slight delay
        setTimeout(sendDOMUpdate, 500);
      })();
    </script>
  `;
  
  return htmlContent.replace('</body>', `${script}</body>`);
};

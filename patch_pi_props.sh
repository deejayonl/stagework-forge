sed -i 's/onUpdateAttribute?: (attr: string, value: string) => void;/onUpdateAttribute?: (attr: string, value: string) => void;\n  onChangeTag?: (tag: string) => void;/g' src/components/PropertyInspector.tsx
sed -i 's/onUpdateAttribute,/onUpdateAttribute,\n  onChangeTag,/g' src/components/PropertyInspector.tsx

#!/bin/bash
# We will use sed to insert the LogicGeneratorModal import and state, then update the Events section.

# 1. Add import
sed -i 's/import { ImageSize } from '\''..\/types'\'';/import { ImageSize } from '\''..\/types'\'';\nimport { LogicGeneratorModal } from '\''.\/LogicGeneratorModal'\'';/' src/components/PropertyInspector.tsx

# 2. Add state
sed -i 's/const \[activeState, setActiveState\] = useState<string>('\''none'\'');/const \[activeState, setActiveState\] = useState<string>('\''none'\'');\n  const \[isLogicModalOpen, setIsLogicModalOpen\] = useState(false);\n  const \[activeLogicEvent, setActiveLogicEvent\] = useState<string | null>(null);/' src/components/PropertyInspector.tsx


#!/bin/sh

LF=$(printf '\\\012_')
LF=${LF%_}

mkdir -p node_modules/scratch-vm/src/extensions/scratch3_scratch2maqueen
cp scratch2maqueen/scratch-vm/src/extensions/scratch3_scratch2maqueen/index.js node_modules/scratch-vm/src/extensions/scratch3_scratch2maqueen/
mv node_modules/scratch-vm/src/extension-support/extension-manager.js node_modules/scratch-vm/src/extension-support/extension-manager.js_orig
sed -e "s|class ExtensionManager {$|builtinExtensions['scratch2maqueen'] = () => require('../extensions/scratch3_scratch2maqueen');${LF}${LF}class ExtensionManager {|g" node_modules/scratch-vm/src/extension-support/extension-manager.js_orig > node_modules/scratch-vm/src/extension-support/extension-manager.js

mkdir -p src/lib/libraries/extensions/scratch2maqueen
cp scratch2maqueen/scratch-gui/src/lib/libraries/extensions/scratch2maqueen/scratch2maqueen.png src/lib/libraries/extensions/scratch2maqueen/
cp scratch2maqueen/scratch-gui/src/lib/libraries/extensions/scratch2maqueen/scratch2maqueen-small.png src/lib/libraries/extensions/scratch2maqueen/
mv src/lib/libraries/extensions/index.jsx src/lib/libraries/extensions/index.jsx_orig
DESCRIPTION="\
    {${LF}\
        name: 'Scratch2Maqueen',${LF}\
        extensionId: 'scratch2maqueen',${LF}\
        collaborator: 'champierre',${LF}\
        iconURL: scratch2maqueenIconURL,${LF}\
        insetIconURL: scratch2maqueenInsetIconURL,${LF}\
        description: (${LF}\
            <FormattedMessage${LF}\
                defaultMessage='Control DFRobot Maqueen.'${LF}\
                description='Control DFRobot Maqueen.'${LF}\
                id='gui.extension.scratch2maqueen.description'${LF}\
            />${LF}\
        ),${LF}\
        featured: true,${LF}\
        disabled: false,${LF}\
        bluetoothRequired: true,${LF}\
        internetConnectionRequired: false,${LF}\
        launchPeripheralConnectionFlow: true,${LF}\
        useAutoScan: false,${LF}\
        helpLink: 'https://champierre.github.io/scratch2maqueen/'${LF}\
    },"
sed -e "s|^export default \[$|import scratch2maqueenIconURL from './scratch2maqueen/scratch2maqueen.png';${LF}import scratch2maqueenInsetIconURL from './scratch2maqueen/scratch2maqueen-small.png';${LF}${LF}export default [${LF}${DESCRIPTION}|g" src/lib/libraries/extensions/index.jsx_orig > src/lib/libraries/extensions/index.jsx

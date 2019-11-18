const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const log = require('../../util/log');
const cast = require('../../util/cast');
const formatMessage = require('format-message');
const BLE = require('../../io/ble');
const Base64Util = require('../../util/base64-util');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAADSGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE5LTEwLTIwVDAyOjEwOjE3PC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5QaXhlbG1hdG9yIDMuOC42PC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjA8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4yNDA8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpDb2xvclNwYWNlPjE8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjI0MDwvZXhpZjpQaXhlbFlE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';

/**
 * Enum for micro:bit BLE command protocol.
 * https://github.com/LLK/scratch-microbit-firmware/blob/master/protocol.md
 * @readonly
 * @enum {number}
 */
const BLECommand = {
    CMD_DISPLAY_TEXT: 0x81,
    CMD_DISPLAY_LED: 0x82,
    CMD_PIN_PWM: 0x92,
    CMD_SLOT_VALUE: 0xA0
};


/**
 * A time interval to wait (in milliseconds) before reporting to the BLE socket
 * that data has stopped coming from the peripheral.
 */
const BLETimeout = 4500;

/**
 * A time interval to wait (in milliseconds) while a block that sends a BLE message is running.
 * @type {number}
 */
const BLESendInterval = 100;

/**
 * A string to report to the BLE socket when the micro:bit has stopped receiving data.
 * @type {string}
 */
const BLEDataStoppedError = 'micro:bit More extension stopped receiving data';

/**
 * Enum for micro:bit protocol.
 * https://github.com/LLK/scratch-microbit-firmware/blob/master/protocol.md
 * @readonly
 * @enum {string}
 */
const BLEUUID = {
    service: 0xf005,
    rxChar: '5261da01-fa7e-42ab-850b-7c80220097cc',
    txChar: '5261da02-fa7e-42ab-850b-7c80220097cc'
};

/**
 * The unit-value of the gravitational acceleration from Micro:bit.
 * @type {number}
 */
const G = 1024;

/**
 * Manage communication with a MicroBit peripheral over a Scrath Link client socket.
 */
class MicroBitMore {

    /**
     * Construct a MicroBit communication object.
     * @param {Runtime} runtime - the Scratch 3.0 runtime
     * @param {string} extensionId - the id of the extension
     */
    constructor (runtime, extensionId) {

        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;

        /**
         * The BluetoothLowEnergy connection socket for reading/writing peripheral data.
         * @type {BLE}
         * @private
         */
        this._ble = null;
        this._runtime.registerPeripheralExtension(extensionId, this);

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * The most recently received value for each sensor.
         * @type {Object.<string, number>}
         * @private
         */
        this._sensors = {
            buttonA: 0,
            buttonB: 0,
            ledMatrixState: new Uint8Array(5),
            lightLevel: 0,
            compassHeading: 0,
            analogValue: {},
            digitalValue: {},
            slot: [0, 0, 0, 0]
        };

        this.analogIn = [0, 1, 2];
        this.analogIn.forEach(pinIndex => {
            this._sensors.analogValue[pinIndex] = 0;
        });
        this.gpio = [
            0, 1, 2,
            8,
            13, 14, 15, 16
        ];
        this.gpio.forEach(pinIndex => {
            this._sensors.digitalValue[pinIndex] = 0;
        });
        this.slotLength = this._sensors.slot.length;

        /**
         * Interval ID for data reading timeout.
         * @type {number}
         * @private
         */
        this._timeoutID = null;

        /**
         * A flag that is true while we are busy sending data to the BLE socket.
         * @type {boolean}
         * @private
         */
        this._busy = false;

        /**
         * ID for a timeout which is used to clear the busy flag if it has been
         * true for a long time.
         */
        this._busyTimeoutID = null;

        this.reset = this.reset.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
    }

    /**
     * @param {string} text - the text to display.
     * @return {Promise} - a Promise that resolves when writing to peripheral.
     */
    displayText (text) {
        const output = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
            output[i] = text.charCodeAt(i);
        }
        return this.send(BLECommand.CMD_DISPLAY_TEXT, output);
    }

    /**
     * @param {Uint8Array} matrix - the matrix to display.
     * @return {Promise} - a Promise that resolves when writing to peripheral.
     */
    displayMatrix (matrix) {
        return this.send(BLECommand.CMD_DISPLAY_LED, matrix);
    }

    /**
     * @return {boolean} - the latest value received for the A button.
     */
    get buttonA () {
        return this._sensors.buttonA;
    }

    /**
     * @return {boolean} - the latest value received for the B button.
     */
    get buttonB () {
        return this._sensors.buttonB;
    }

    /**
     * @return {Uint8Array} - the current state of the 5x5 LED matrix.
     */
    get ledMatrixState () {
        return this._sensors.ledMatrixState;
    }

    /**
     * @return {number} - the latest value received for the amount of light falling on the LEDs.
     */
    get lightLevel () {
        return this._sensors.lightLevel;
    }

    /**
     * @return {number} - the angle (degrees) of heading direction from the north.
     */
    get compassHeading () {
        return this._sensors.compassHeading;
    }

    /**
     * @return {number} - the value of magnetic field strength [nano tesla].
     */
    get magneticStrength () {
        return this._sensors.magneticStrength;
    }

    /**
     * @return {number} - the value of gravitational acceleration [milli-g] for the X axis.
     */
    get accelerationX () {
        return 1000 * this._sensors.accelerationX / G;
    }

    /**
     * @return {number} - the value of acceleration [milli-g] for the Y axis.
     */
    get accelerationY () {
        return 1000 * this._sensors.accelerationY / G;
    }

    /**
     * @return {number} - the value of acceleration [milli-g] for the Z axis.
     */
    get accelerationZ () {
        return 1000 * this._sensors.accelerationZ / G;
    }

    /**
     * Called by the runtime when user wants to scan for a peripheral.
     */
    scan () {
        if (this._ble) {
            this._ble.disconnect();
        }
        this._ble = new BLE(this._runtime, this._extensionId, {
            filters: [
                {services: [BLEUUID.service]}
            ]
        }, this._onConnect, this.reset);
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect (id) {
        if (this._ble) {
            this._ble.connectPeripheral(id);
        }
    }

    /**
     * Disconnect from the micro:bit.
     */
    disconnect () {
        if (this._ble) {
            this._ble.disconnect();
        }

        this.reset();
    }

    /**
     * Reset all the state and timeout/interval ids.
     */
    reset () {
        if (this._timeoutID) {
            window.clearTimeout(this._timeoutID);
            this._timeoutID = null;
        }
    }

    /**
     * Return true if connected to the micro:bit.
     * @return {boolean} - whether the micro:bit is connected.
     */
    isConnected () {
        let connected = false;
        if (this._ble) {
            connected = this._ble.isConnected();
        }
        return connected;
    }

    /**
     * Send a message to the peripheral BLE socket.
     * @param {number} command - the BLE command hex.
     * @param {Uint8Array} message - the message to write
     * @param {object} util - utility object provided by the runtime.
     */
    send (command, message, util) {
        if (!this.isConnected()) return;
        if (this._busy) {
            if (util) util.yield();
            return;
        }

        // Set a busy flag so that while we are sending a message and waiting for
        // the response, additional messages are ignored.
        this._busy = true;

        // Set a timeout after which to reset the busy flag. This is used in case
        // a BLE message was sent for which we never received a response, because
        // e.g. the peripheral was turned off after the message was sent. We reset
        // the busy flag after a while so that it is possible to try again later.
        this._busyTimeoutID = window.setTimeout(() => {
            this._busy = false;
        }, 5000);

        const output = new Uint8Array(message.length + 1);
        output[0] = command; // attach command to beginning of message
        for (let i = 0; i < message.length; i++) {
            output[i + 1] = message[i];
        }
        const data = Base64Util.uint8ArrayToBase64(output);

        this._ble.write(BLEUUID.service, BLEUUID.txChar, data, 'base64', true).then(
            () => {
                this._busy = false;
                window.clearTimeout(this._busyTimeoutID);
            }
        );
    }

    /**
     * Starts reading data from peripheral after BLE has connected to it.
     * @private
     */
    _onConnect () {
        this._ble.read(BLEUUID.service, BLEUUID.rxChar, true, this._onMessage);
        this._timeoutID = window.setTimeout(
            () => this._ble.handleDisconnectError(BLEDataStoppedError),
            BLETimeout
        );

        const dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, 0, true);

        // To stop continuous tick sound.
        this.send(BLECommand.CMD_PIN_PWM,
            new Uint8Array([
                0,
                dataView.getUint8(0),
                dataView.getUint8(1)]),
            null);
    }

    /**
     * Process the sensor data from the incoming BLE characteristic.
     * @param {object} base64 - the incoming BLE data.
     * @private
     */
    _onMessage (base64) {
        // parse data
        const data = Base64Util.base64ToUint8Array(base64);

        this._sensors.buttonA = data[4];
        this._sensors.buttonB = data[5];

        // More extension
        const dataView = new DataView(data.buffer, 0);
        if (data[19] === 0x01) {
            this._sensors.analogValue[this.analogIn[0]] = dataView.getUint16(10, true);
            this._sensors.analogValue[this.analogIn[1]] = dataView.getUint16(12, true);
            this._sensors.analogValue[this.analogIn[2]] = dataView.getUint16(14, true);
            this._sensors.compassHeading = dataView.getUint16(16, true);
            this._sensors.lightLevel = dataView.getUint8(18);
        }
        if (data[19] === 0x02) {
            this._sensors.slot[0] = dataView.getInt16(10, true);
            this._sensors.slot[1] = dataView.getInt16(12, true);
            this._sensors.slot[2] = dataView.getInt16(14, true);
            this._sensors.slot[3] = dataView.getInt16(16, true);
            const gpioData = dataView.getUint8(18);
            for (let i = 0; i < this.gpio.length; i++) {
                this._sensors.digitalValue[this.gpio[i]] = (gpioData >> i) & 1;
            }
        }
        if (data[19] === 0x03) {
            this._sensors.magneticStrength = dataView.getUint16(10, true);
            this._sensors.accelerationX = dataView.getInt16(12, true);
            this._sensors.accelerationY = dataView.getInt16(14, true);
            this._sensors.accelerationZ = dataView.getInt16(16, true);
        }

        // cancel disconnect timeout and start a new one
        window.clearTimeout(this._timeoutID);
        this._timeoutID = window.setTimeout(
            () => this._ble.handleDisconnectError(BLEDataStoppedError),
            BLETimeout
        );
    }

    /**
     * Return the value of the slot.
     * @param {number} index - the slot index.
     * @return {number} - the latest value received for the slot.
     */
    getSlotValue (index) {
        return this._sensors.slot[index];
    }

    setSlotValue (slotIndex, slotValue, util) {
        const dataView = new DataView(new ArrayBuffer(2));
        dataView.setInt16(0, slotValue, true);
        this.send(BLECommand.CMD_SLOT_VALUE,
            new Uint8Array([
                slotIndex,
                dataView.getUint8(0),
                dataView.getUint8(1)]),
            util);
        this._sensors.slot[slotIndex] = slotValue;
    }
}

/**
 * Enum for micro:bit buttons.
 * @readonly
 * @enum {string}
 */
const MicroBitButtons = {
    A: 'A',
    B: 'B',
    ANY: 'any'
};

/**
 * Enum for axis menu options.
 * @readonly
 * @enum {string}
 */
const AxisValues = {
    X: 'x',
    Y: 'y',
    Z: 'z'
};

const LEDState = {
    ON: 'on',
    OFF: 'off'
};

/**
 * Scratch 3.0 blocks to interact with a MicroBit peripheral.
 */
class Scratch3Scratch2MaqueenBlocks {

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return 'Scratch2Maqueen';
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return 'scratch2maqueen';
    }

    /**
     * @return {array} - text and values for each buttons menu element
     */
    get BUTTONS_MENU () {
        return [
            {
                text: 'A',
                value: MicroBitButtons.A
            },
            {
                text: 'B',
                value: MicroBitButtons.B
            },
            {
                text: formatMessage({
                    id: 'microbit.buttonsMenu.any',
                    default: 'any',
                    description: 'label for "any" element in button picker for micro:bit extension'
                }),
                value: MicroBitButtons.ANY
            }
        ];
    }

    /**
     * @return {array} - text and values for LED state menu element
     */
    get LED_STATE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'scratch2maqueen.ledStateMenu.on',
                    default: 'on',
                    description: 'label for on element in LED state picker'
                }),
                value: LEDState.ON
            },
            {
                text: formatMessage({
                    id: 'scratch2maqueen.ledStateMenu.off',
                    default: 'off',
                    description: 'label for off element in LED state picker'
                }),
                value: LEDState.OFF
            }
        ];
    }

    get AXIS_MENU () {
        return [
            {
                text: 'x',
                value: AxisValues.X
            },
            {
                text: 'y',
                value: AxisValues.Y
            },
            {
                text: 'z',
                value: AxisValues.Z
            }
        ];
    }

    /**
     * Construct a set of MicroBit blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new MicroBit peripheral instance
        this._peripheral = new MicroBitMore(this.runtime, Scratch3Scratch2MaqueenBlocks.EXTENSION_ID);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        this.setupTranslations();
        return {
            id: Scratch3Scratch2MaqueenBlocks.EXTENSION_ID,
            name: Scratch3Scratch2MaqueenBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'leftMotorSpeed',
                    text: formatMessage({
                        id: 'scratch2maqueen.leftMotorSpeed',
                        default: 'Set left motor speed to [VALUE] (-255 - 255)',
                        description: 'set left motor speed'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'rightMotorSpeed',
                    text: formatMessage({
                        id: 'scratch2maqueen.rightMotorSpeed',
                        default: 'Set right motor speed to [VALUE] (-255 - 255)',
                        description: 'set right motor speed'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'getDistance',
                    text: formatMessage({
                        id: 'scratch2maqueen.getDistance',
                        default: 'Distance to obstacles ahead(cm)',
                        description: 'distance to obstacles ahead(cm)'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getPatrolLeft',
                    text: formatMessage({
                        id: 'scratch2maqueen.getPatrolLeft',
                        default: 'Patrol Left',
                        description: 'value of patrol left'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getPatrolRight',
                    text: formatMessage({
                        id: 'scratch2maqueen.getPatrolRight',
                        default: 'Patrol Right',
                        description: 'value of patrol right'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'ledLeft',
                    text: formatMessage({
                        id: 'scratch2maqueen.ledLeft',
                        default: 'Turn left LED [LED_STATE]',
                        description: 'turn left LED on/off'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LED_STATE: {
                            type: ArgumentType.STRING,
                            menu: 'ledState',
                            defaultValue: LEDState.ON
                        }
                    }
                },
                {
                    opcode: 'ledRight',
                    text: formatMessage({
                        id: 'scratch2maqueen.ledRight',
                        default: 'Turn right LED [LED_STATE]',
                        description: 'turn right LED on/off'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LED_STATE: {
                            type: ArgumentType.STRING,
                            menu: 'ledState',
                            defaultValue: LEDState.ON
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenButtonPressed',
                    text: formatMessage({
                        id: 'microbit.whenButtonPressed',
                        default: 'when [BTN] button pressed',
                        description: 'when the selected button on the micro:bit is pressed'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        BTN: {
                            type: ArgumentType.STRING,
                            menu: 'buttons',
                            defaultValue: MicroBitButtons.A
                        }
                    }
                },
                {
                    opcode: 'isButtonPressed',
                    text: formatMessage({
                        id: 'microbit.isButtonPressed',
                        default: '[BTN] button pressed?',
                        description: 'is the selected button on the micro:bit pressed?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        BTN: {
                            type: ArgumentType.STRING,
                            menu: 'buttons',
                            defaultValue: MicroBitButtons.A
                        }
                    }
                },
                '---',
                {
                    opcode: 'displaySymbol',
                    text: formatMessage({
                        id: 'microbit.displaySymbol',
                        default: 'display [MATRIX]',
                        description: 'display a pattern on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MATRIX: {
                            type: ArgumentType.MATRIX,
                            defaultValue: '0101010101100010101000100'
                        }
                    }
                },
                {
                    opcode: 'displayText',
                    text: formatMessage({
                        id: 'microbit.displayText',
                        default: 'display text [TEXT]',
                        description: 'display text on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'microbit.defaultTextToDisplay',
                                default: 'Hello!',
                                description: `default text to display.
                                IMPORTANT - the micro:bit only supports letters a-z, A-Z.
                                Please substitute a default word in your language
                                that can be written with those characters,
                                substitute non-accented characters or leave it as "Hello!".
                                Check the micro:bit site documentation for details`
                            })
                        }
                    }
                },
                {
                    opcode: 'displayClear',
                    text: formatMessage({
                        id: 'microbit.clearDisplay',
                        default: 'clear display',
                        description: 'display nothing on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND
                },
                '---',
                {
                    opcode: 'getLightLevel',
                    text: formatMessage({
                        id: 'scratch2maqueen.lightLevel',
                        default: 'light intensity',
                        description: 'how much the amount of light falling on the LEDs on micro:bit'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getCompassHeading',
                    text: formatMessage({
                        id: 'scratch2maqueen.compassHeading',
                        default: 'angle with the North',
                        description: 'angle from the North to the micro:bit heading direction'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getMagneticStrength',
                    text: formatMessage({
                        id: 'scratch2maqueen.magneticForce',
                        default: 'magnetic force',
                        description: 'value of magnetic field strength (nano tesla)'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getAcceleration',
                    text: formatMessage({
                        id: 'scratch2maqueen.acceleration',
                        default: 'acceleration [AXIS]',
                        description: 'value of acceleration on the axis (milli-g)'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.STRING,
                            menu: 'axis',
                            defaultValue: AxisValues.X
                        }
                    }
                }
            ],
            menus: {
                buttons: {
                    acceptReporters: true,
                    items: this.BUTTONS_MENU
                },
                ledState: {
                    acceptReporters: true,
                    items: this.LED_STATE_MENU
                },
                axis: {
                    acceptReporters: true,
                    items: this.AXIS_MENU
                }
            }
        };
    }

    /**
     * Test whether the A or B button is pressed
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    whenButtonPressed (args) {
        if (args.BTN === 'any') {
            return this._peripheral.buttonA | this._peripheral.buttonB;
        } else if (args.BTN === 'A') {
            return this._peripheral.buttonA;
        } else if (args.BTN === 'B') {
            return this._peripheral.buttonB;
        }
        return false;
    }

    /**
     * Test whether the A or B button is pressed
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    isButtonPressed (args) {
        if (args.BTN === 'any') {
            return (this._peripheral.buttonA | this._peripheral.buttonB) !== 0;
        } else if (args.BTN === 'A') {
            return this._peripheral.buttonA !== 0;
        } else if (args.BTN === 'B') {
            return this._peripheral.buttonB !== 0;
        }
        return false;
    }

    /**
     * Display a predefined symbol on the 5x5 LED matrix.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after a tick.
     */
    displaySymbol (args) {
        const symbol = cast.toString(args.MATRIX).replace(/\s/g, '');
        const reducer = (accumulator, c, index) => {
            const value = (c === '0') ? accumulator : accumulator + Math.pow(2, index);
            return value;
        };
        const hex = symbol.split('').reduce(reducer, 0);
        if (hex !== null) {
            this._peripheral.ledMatrixState[0] = hex & 0x1F;
            this._peripheral.ledMatrixState[1] = (hex >> 5) & 0x1F;
            this._peripheral.ledMatrixState[2] = (hex >> 10) & 0x1F;
            this._peripheral.ledMatrixState[3] = (hex >> 15) & 0x1F;
            this._peripheral.ledMatrixState[4] = (hex >> 20) & 0x1F;
            this._peripheral.displayMatrix(this._peripheral.ledMatrixState);
        }

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Display text on the 5x5 LED matrix.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after the text is done printing.
     * Note the limit is 19 characters
     * The print time is calculated by multiplying the number of horizontal pixels
     * by the default scroll delay of 120ms.
     * The number of horizontal pixels = 6px for each character in the string,
     * 1px before the string, and 5px after the string.
     */
    displayText (args) {
        const text = String(args.TEXT).substring(0, 19);
        if (text.length > 0) this._peripheral.displayText(text);
        const yieldDelay = 120 * ((6 * text.length) + 6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, yieldDelay);
        });
    }

    /**
     * Turn all 5x5 matrix LEDs off.
     * @return {Promise} - a Promise that resolves after a tick.
     */
    displayClear () {
        for (let i = 0; i < 5; i++) {
            this._peripheral.ledMatrixState[i] = 0;
        }
        this._peripheral.displayMatrix(this._peripheral.ledMatrixState);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Return amount of light on the LEDs.
     * @return {number} - the level of light amount (0 - 255).
     */
    getLightLevel () {
        return this._peripheral.lightLevel;
    }

    /**
     * Return angle from the north to the micro:bit heading direction.
     * @return {number} - the angle from the north (0 - 355 degrees).
     */
    getCompassHeading () {
        return this._peripheral.compassHeading;
    }

    // initialize (args, util) {
    //     this._peripheral.setPinPWM(0, 0, util);
    // }

    leftMotorSpeed (args, util) {
        const slotIndex = 0;
        const slotValue = parseInt(args.VALUE, 10);
        if (isNaN(slotValue)) return;
        this._peripheral.setSlotValue(slotIndex, slotValue, util);
    }

    rightMotorSpeed (args, util) {
        const slotIndex = 1;
        const slotValue = parseInt(args.VALUE, 10);
        if (isNaN(slotValue)) return;
        this._peripheral.setSlotValue(slotIndex, slotValue, util);
    }

    getDistance () {
        return this._peripheral.getSlotValue(2);
    }

    getPatrolLeft () {
        let slotValue = this._peripheral.getSlotValue(3);
        let bools = this.splitToBools(slotValue);
        return bools[2];
    }

    getPatrolRight () {
        let slotValue = this._peripheral.getSlotValue(3);
        let bools = this.splitToBools(slotValue);
        return bools[3];
    }

    ledLeft (args, util) {
        let slotValue = this._peripheral.getSlotValue(3);
        let bools = this.splitToBools(slotValue);
        if (args.LED_STATE == LEDState.ON) {
          bools[0] = 1;
        } else {
          bools[0] = 0;
        }
        this._peripheral.setSlotValue(3, this.joinBools(bools), util);
    }

    ledRight (args, util) {
        let slotValue = this._peripheral.getSlotValue(3);
        let bools = this.splitToBools(slotValue);
        if (args.LED_STATE == LEDState.ON) {
          bools[1] = 1;
        } else {
          bools[1] = 0;
        }
        this._peripheral.setSlotValue(3, this.joinBools(bools), util);
    }

    splitToBools (value) {
      let bools = [];
      bools[0] = Math.floor(value / 8);
      bools[1] = Math.floor((value - bools[0] * 8) / 4);
      bools[2] = Math.floor((value - bools[0] * 8 - bools[1] * 4) / 2);
      bools[3] = (value - bools[0] * 8 - bools[1] * 4) % 2;
      return bools;
    }

    joinBools (bools) {
      return bools[0] * 8 + bools[1] * 4 + bools[2] * 2 + bools[3];
    }

    /**
     * Return the value of magnetic field strength.
     * @return {number} - the value of magnetic field strength [nano tesla].
     */
    getMagneticStrength () {
        return this._peripheral.magneticStrength;
    }

    /**
     * Return the value of acceleration on the specified axis.
     * @param {object} args - the block's arguments.
     * @property {AxisValues} AXIS - the axis (X, Y, Z).
     * @return {number} - the value of acceleration on the axis [milli-g].
     */
    getAcceleration (args) {
        switch (args.AXIS) {
        case AxisValues.X:
            return this._peripheral.accelerationX;
        case AxisValues.Y:
            return this._peripheral.accelerationY;
        case AxisValues.Z:
            return this._peripheral.accelerationZ;
        default:
            log.warn(`Unknown axis in getAcceleration: ${args.AXIS}`);
        }
    }

    setupTranslations () {
        const localeSetup = formatMessage.setup();
        const extTranslations = {
            'ja': {
                'scratch2maqueen.lightLevel': '明るさ',
                'scratch2maqueen.compassHeading': '北からの角度',
                'scratch2maqueen.magneticForce': '磁力',
                'scratch2maqueen.acceleration': '加速度 [AXIS]',
                'scratch2maqueen.initialize': '初期化する',
                'scratch2maqueen.leftMotorSpeed': '左モーターの速さを [VALUE] (-255〜255)にする',
                'scratch2maqueen.rightMotorSpeed': '右モーターの速さを [VALUE] (-255〜255)にする',
                'scratch2maqueen.getDistance': '前方の障害物との距離(cm)',
                'scratch2maqueen.getPatrolLeft': '左側床の明るさ(黒:0, 白:1)',
                'scratch2maqueen.getPatrolRight': '右側床の明るさ(黒:0, 白:1)',
                'scratch2maqueen.ledLeft': '左側LED [LED_STATE]',
                'scratch2maqueen.ledRight': '右側LED [LED_STATE]',
                'scratch2maqueen.ledStateMenu.on': '入',
                'scratch2maqueen.ledStateMenu.off': '切'
            },
            'ja-Hira': {
                'scratch2maqueen.lightLevel': 'あかるさ',
                'scratch2maqueen.compassHeading': 'きたからのかくど',
                'scratch2maqueen.magneticForce': 'じりょく',
                'scratch2maqueen.acceleration': 'かそくど [AXIS]',
                'scratch2maqueen.initialize': 'しょきかする',
                'scratch2maqueen.leftMotorSpeed': 'ひだりモーターのはやさを [VALUE] (-255〜255)にする',
                'scratch2maqueen.rightMotorSpeed': 'みぎモーターのはやさを [VALUE] (-255〜255)にする',
                'scratch2maqueen.getDistance': 'ぜんぽうのしょうがいぶつとのきょり(cm)',
                'scratch2maqueen.getPatrolLeft': 'ひだりがわゆかのあかるさ(くろ:0, しろ:1)',
                'scratch2maqueen.getPatrolRight': 'みぎがわゆかのあかるさ(くろ:0, しろ:1)',
                'scratch2maqueen.ledLeft': 'ひだりがわLED [LED_STATE]',
                'scratch2maqueen.ledRight': 'みぎがわLED [LED_STATE]',
                'scratch2maqueen.ledStateMenu.on': 'いり',
                'scratch2maqueen.ledStateMenu.off': 'きり'
            }
        };
        for (const locale in extTranslations) {
            if (!localeSetup.translations[locale]) {
                localeSetup.translations[locale] = {};
            }
            Object.assign(localeSetup.translations[locale], extTranslations[locale]);
        }
    }
}

module.exports = Scratch3Scratch2MaqueenBlocks;

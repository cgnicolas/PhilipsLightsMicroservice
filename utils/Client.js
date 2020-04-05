const v3 = require('node-hue-api').v3
, hueApi = v3.api;

const EventEmitter = require('events');

class Client {
    constructor(bridgeIP, appName, deviceName, username) {
        this.bridgeIP = bridgeIP;
        this.appName = appName;
        this.deviceName = deviceName;
        this.username = username;
        this.createdUser = null;
        this.bridgeConfig = null;
        this.emitter = new EventEmitter();
        this.lights = [];
        this.connected = false;
        this.bindFunctions = this.bindFunctions.bind(this);
        this.bindFunctions();
        this._setup()
        .catch((err) => {
            console.log(err.stack);
        });
    }

    bindFunctions() {
        this._createUser = this._createUser.bind(this);
        this.setLightState = this.setLightState.bind(this);
        this._printUser = this._printUser.bind(this);
        this._setup = this._setup.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.getLights = this.getLights.bind(this);
        this._getLightInventory = this._getLightInventory.bind(this);
        this._findLightIdByName = this._findLightIdByName.bind(this);
        this._getLocalLights = this._getLocalLights.bind(this);
        // this._updateLocalStates = this._updateLocalStates.bind(this);
        this._invokeInstruction = this._invokeInstruction.bind(this);
        this._prepareForInstruction = this._prepareForInstruction.bind(this);
        this._getLocalLightState = this._getLocalLightState.bind(this);
        this._findLightIndexById = this._findLightIndexById.bind(this);
        this.power = this.power.bind(this);
        this.getRooms = this.getRooms.bind(this);
    }

    async _setup(){
        const { username, bridgeIP, emitter } = this;
        if(username) {
            return hueApi.createLocal(bridgeIP).connect(username)
            .then((api) => {
                this.authenticatedApi = api;
                console.log("Successfully connected with username given!");
            })
            .then(() => {
                return this._getLightInventory()
            })
            .then(() => {
                this.connected = true;
                emitter.emit('Connected')
            })
        } else {
            return this._createUser()
            .then(() => {
                return this._getLightInventory()
            })
            .then(() => {
                this.connected = true;
                emitter.emit('Connected');
            });
        }
    }

    async _getLightInventory() {
        return new Promise((resolve, reject) => {
            console.log("Getting inventory")
            this.getLights()
            .then((allLights) => {
                allLights.forEach((light) => {
                    this.lights.push({
                        id: light.id,
                        name: light._data.name,
                        state: light._data.state
                    })
                })
                resolve(this.lights);
            })
            .catch((err) => {
                reject(err);
            })
        })    
    }

    // async _updateLocalStates() {
    //     return new Promise((resolve, reject) => {
    //         this.getLights()
    //         .then((allLights) => {
    //             allLights.forEach((light) => {
    //                 const toUpdate = this.lights.findIndex((el) => el.id === light.id)
    //                 this.lights[toUpdate].state = light._data.state;
    //             })
    //             resolve();
    //         })
    //         .catch((err) => {
    //             reject(err);
    //         })
    //     })
    // }

    async _createUser(){
        const unauthenticatedApi = await hueApi.createLocal(this.bridgeIP).connect();

        try {
            this.createdUser = await unauthenticatedApi.users.createUser(this.appName, this.deviceName);
            console.log('*******************************************************************************\n');
            console.log('User has been created on the Hue Bridge. The following username can be used to\n' +
                        'authenticate with the Bridge and provide full local access to the Hue Bridge.\n' +
                        'YOU SHOULD TREAT THIS LIKE A PASSWORD\n');
            console.log(`Hue Bridge User: ${createdUser.username}`);
            console.log(`Hue Bridge User Client Key: ${createdUser.clientkey}`);
            console.log('*******************************************************************************\n');

            this.authenticatedApi = await hueApi.createLocal(this.bridgeIP).connect(this.createdUser.username);
            this.bridgeConfig = await this.authenticatedApi.configuration.getConfiguration();
            console.log(`Connected to Hue Bridge: ${bridgeConfig.name} :: ${bridgeConfig.ipaddress}`);

        } catch(err) {
            if(err.getHueErrorType() === 101){
                console.error('The Link button on the bridge was not pressed. Please press the Link Button and try again.');
            } else {
                console.error(`Unexpected Error: ${err.message}`);
            }
        }
    }

    async executeInstruction(instruction, payload){
        this._prepareForInstruction(instruction, payload)
        .then(() => {
            this._invokeInstruction(instruction, payload)
            .then(() => {
                this.lights = [];
                return this._getLightInventory();
            })

        })
        .catch((err) => {
            return err;
        })
    }

    async _invokeInstruction(instruction, payload){
        switch (instruction) {
            case 'setstate':
                return this.setLightState(payload.id, payload.state);
            case 'power':
                return this.power(payload.id);
            default:
                return;
        }
    }

    async _prepareForInstruction(instruction, payload){
        return new Promise((resolve, reject) => {
            let stateSetup;
            if(instruction.includes('set')){
                stateSetup = {
                    on: true,
                    effect: 'none'
                }
            }
            if(!instruction.includes('get') && instruction !== 'power'){
                return resolve(this.setLightState(payload.id, stateSetup));
            } else {
                return resolve();
            }
        })
    }

    async setLightState(light_id, state){
        const { authenticatedApi } = this;
        return authenticatedApi.lights.setLightState(light_id, state);
    }

    async getUsers() {
        const { authenticatedApi } = this;
        if(authenticatedApi){
            console.log("Retrieving Users");
            return authenticatedApi.users.getAll();
        }
    }

    async getLights() {
        const { authenticatedApi } = this;
        if(authenticatedApi) {
            return authenticatedApi.lights.getAll();
        }
    }

    async getLightState(id){
        const {authenticatedApi} = this;
        if(authenticatedApi) {
            return authenticatedApi.lights.getLightState(id);
        }
    }

    async power(id){
        this.getLightState(id)
        .then((light) => {
            // console.log(light)
            console.log("powered");
            return this.setLightState(id, {on: !light.on})
        })
        .catch((err) => {
            console.log(err);
            return err;
        })
    }

    async getRooms(){
        const {authenticatedApi} = this;

        if(authenticatedApi) {
            return authenticatedApi.groups.getAll()
        }
    }

    _getLocalLightState(id){
        return this.lights[this._findLightIndexById(id)].state;
    }

    _findLightIdByName(name) {
        return this.lights.filter((light) => light.name === name)[0].id;
    }

    _findLightIndexById(id){
        return this.lights.findIndex((el) => el.id === id);
    }

    _getLocalLights(){
        return this.lights;
    }

    _printUser(){
        console.log(this.createdUser);
    }
}

module.exports = Client;

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

    _getLightInventory() {
        return new Promise((resolve, reject) => {
            console.log("Getting inventory")
            this.getLights()
            .then((allLights) => {
                allLights.forEach((light) => {
                    this.lights.push(light._data)
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

    executeInstruction(instruction, payload){
        console.log("execute")
        return new Promise((resolve, reject) => {
            this._prepareForInstruction(instruction, payload)
            .then(() => {
                return this._invokeInstruction(instruction, payload)
            })
            .then(() => {
                this.getLights()
                .then((lights) => {
                    let response = [];
                    lights.forEach((light) => {
                        response.push(light._data);
                    })
                    resolve(response);
                })
            })
            .catch((err) => {
                reject(err);
            })
        })
    }

    _invokeInstruction(instruction, payload){
        console.log("invoke")
            switch (instruction) {
                case 'setstate':
                    return new Promise((resolve, reject) => {
                        this.setLightState(payload.id, payload.state)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                    })
                case 'power':
                    return new Promise((resolve, reject) => {
                        this.power(payload.id)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        })
                    })
                case 'getlights':
                    return new Promise((resolve, reject) => {
                        this.getLights()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        })
                    });
                default:
                    return;
            }
        
    }

    _prepareForInstruction(instruction, payload){
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

    setLightState(light_id, state){
        return new Promise((resolve, reject) => {
            const { authenticatedApi } = this;
            if(authenticatedApi){
                authenticatedApi.lights.setLightState(light_id, state)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                })
            }
        })
    }

    getUsers() {
        const { authenticatedApi } = this;
        if(authenticatedApi){
            console.log("Retrieving Users");
            return authenticatedApi.users.getAll();
        }
    }

    getLights() {
        return new Promise((resolve, reject) => {
            const { authenticatedApi } = this;
            if(authenticatedApi) {
                console.log("Executing get lights");
                authenticatedApi.lights.getAll()
                .then((lights) => {
                    console.log("Resolving Get Lights")
                    resolve(lights)
                })
                .catch((err) => {
                    reject(err);
                });
            }
        })
    }

    getLightState(id){
        return new Promise((resolve, reject) => {
            const {authenticatedApi} = this;
            if(authenticatedApi) {
                authenticatedApi.lights.getLightState(id)
                .then((lightState) => {
                    console.log("Resolving get light state")
                    resolve(lightState);
                })
                .catch((err) => {
                    reject(err);
                });
            }
        })
    }

    power(id){
        console.log("power")
        return new Promise((resolve, reject) => {
            this.getLightState(id)
            .then((lightState) => {
                this.setLightState(id, {on: !lightState.on})
                .then(() => {
                    console.log("resolving power");
                    resolve();
                })
            })
            .catch((err) => {
                console.log(err);
                reject(err.stack);
            })
        })
        
    }

    getRooms(){
        return new Promise((resolve, reject) => {
            const {authenticatedApi} = this;
            if(authenticatedApi) {
                authenticatedApi.groups.getAll()
                .then((rooms) => {
                    resolve(rooms);
                })
                .catch((err) => {
                    reject(err);
                })
            }
        })
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

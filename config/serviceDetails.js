const ip = require('ip');
module.exports = {
    service: {
        name: 'Lights',
        description: 'Used to view the status and control the Lights Microservice',
        port: 4002,
        ip: ip.address(),
        procedures: [
            {
                name: 'setcolor',
                options: {
                    method: 'PATCH',
                    path:'/process/set/color' 
                }
            }, 
            {
                name: 'getlights',
                options: {
                    method: 'GET',
                    path:'/process/get/lights'
                }
            },
            {
                name: 'power',
                options: {
                    method: 'POST',
                    path: '/process/power'
                }
            },
            {
                name: 'setbrightness',
                options: {
                    method: 'PATCH',
                    path: '/process/set/brightness'
                }
            },
            {
                name: 'getrooms',
                options: {
                    method: 'GET',
                    path: '/process/get/rooms'
                }
            }
        ]
    }
}
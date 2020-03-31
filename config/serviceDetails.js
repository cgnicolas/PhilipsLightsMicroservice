module.exports = {
    service: {
        name: 'Lights',
        description: 'Used to view the status and control the Lights Microservice',
        port: 4002,
        host: 'http://localhost:4002',
        procedures: [
            {
                name: 'setcolor',
                options: {
                    method: 'PATCH',
                    url:'http://localhost:4002/process/set/color' 
                }
            }, 
            {
                name: 'getlights',
                options: {
                    method: 'GET',
                    url:'http://localhost:4002/process/get/lights'
                }
            },
            {
                name: 'power',
                options: {
                    method: 'POST',
                    url: 'http://localhost:4002/process/power'
                }
            },
            {
                name: 'setbrightness',
                options: {
                    method: 'PATCH',
                    url: 'http://localhost:4002/process/set/brightness'
                }
            },
            {
                name: 'getrooms',
                options: {
                    method: 'GET',
                    url: 'http://localhost:4002/process/get/rooms'
                }
            }
        ]
    }
}
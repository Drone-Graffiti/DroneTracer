const formMessage = function(caller, msg) {
    return `DroneTracer, ${caller} | ${msg}`
}

const errorThrow = function(msg) {
    throw formMessage(arguments.callee.caller.name, msg)
}

const errorReject = function(promiseReject, msg) {
    promiseReject( formMessage(arguments.callee.caller.name, msg) )
}

export {errorThrow as throw, errorReject as reject}



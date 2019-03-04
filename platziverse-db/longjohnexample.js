// si la variable de entorno de node no es produccion aplicamos longjohn
if (process.env.NODE_ENV !== "production") require('longjohn')
setTimeout(() => {
    throw new Error('boom')
}, 2000)
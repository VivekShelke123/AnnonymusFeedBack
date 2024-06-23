import mongoose from 'mongoose';

type connectionObject = {
    isConnected? : number;
}

const connection : connectionObject = {};

async function dbConnect() : Promise<void> {
    if(connection.isConnected){
        console.log('Already Connected ');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "" , {});
        console.log(db.connections)
        connection.isConnected = db.connections[0].readyState;
        console.log('DataBase Connected Successfully');
        
    } catch (error) {
        console.error('Error Occured While Connecting',error);      
        process.exit(1);
    }
}

export default dbConnect;
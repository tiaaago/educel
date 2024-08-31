import { connect } from 'mongoose';
const connection = {};

async function dbConnection() {
    if (connection.isConnected) {
        return;
    }

    const db = await connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    connection.isConnected = db.connections[0].readyState;
}

export default dbConnection;
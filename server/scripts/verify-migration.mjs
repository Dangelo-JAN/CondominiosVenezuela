import mongoose from 'mongoose';
import { HumanResources } from '../models/HR.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const MONGODB_URI = 'mongodb+srv://cluster_cia_admin:dscuckdsSDCrfercdcc@clusterpruebacia.5hhyvrx.mongodb.net/?appName=ClusterPruebaCIA';

await mongoose.connect(MONGODB_URI);
const hrs = await HumanResources.find({}).select('firstname lastname role cargo permissions.payroll');
hrs.forEach(hr => console.log(hr.firstname, hr.lastname, hr.role, hr.cargo, JSON.stringify(hr.permissions?.payroll)));
await mongoose.disconnect();
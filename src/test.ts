
import {Context} from './utils/getcontext'

const context = Context.get();

console.log(context.config['app.cache-dir'])


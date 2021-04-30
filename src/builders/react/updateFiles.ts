import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";
// const xml = require('modify-xml');
const xml2js = require('xml2js');
import {Context} from "../../utils/getcontext";
import path from "path";
import * as fs from "fs";


const logger = createLogger(__filename)
const context = Context.get()

export class UpdateFiles extends Task {
    execute(data: any): void {
        logger.info('Updating files')

        const tasks = new UpdateAndroidManifest()

        tasks.addNextTask(new UpdateColor())
        tasks.addNextTask(new UpdateStyle())
        tasks.addNextTask(new UpdateAppName())

        tasks.addNextTask((new UpdateIcons()).setCallback(_ => this.next(data)))

        try {
            tasks.execute(data)
        } catch (error) {
            logger.error(error)
        }
    }
}

// Update package name, set permissions
class UpdateAndroidManifest extends Task {
    execute(data: any): void {
        logger.info(`${this.constructor.name}`);

        // loading required files
        const pkg = require(path.join(context.project_dir, 'package.json'));
        const androidManifestPath = path.join(data.project.build_path, '.androidjs', 'AndroidManifest.xml');

        const app_name = pkg['app-name'] || pkg['name'];
        const package_name = pkg['package-name'];
        const permissions: Array<string> = pkg['permission'];

        if(!package_name) {
            logger.error('package-name not found in package.json')
            throw 'package-name not found in package.json'
        }

        if (!app_name) {
            logger.error('app-name not define in package.json');
            throw 'app-name not define in package.json';
        }

        if (!data.release) {
            logger.info(`Building app in debug mode.`);
        }

        let androidManifest = fs.readFileSync(androidManifestPath);
        let manifest_data = androidManifest.toString()
        let parser = new xml2js.Parser();
        let builder = new xml2js.Builder();

        parser.parseString(manifest_data, (error:any, document: any) => {
            if(error) throw error

            // Update Package name
            document.manifest.$.package = package_name

            // Set permission
            /// document.manifest['uses-permission']
            document.manifest['uses-permission'] = []
            for(const permission of permissions) {
                document.manifest['uses-permission'].push({$: {'android:name': permission}})
            }

            // replace AndroidManifest
            const updated_document = builder.buildObject(document);
            fs.writeFileSync(androidManifestPath, updated_document);

            logger.debug(updated_document)
            this.next(data)
        })

        // this.next(data)
    }
}



// Update theme colors
class UpdateColor extends Task {
    execute(data: any): void {
        logger.info(`${this.constructor.name}`)

        const pkg = require(path.join(context.project_dir, 'package.json'));
        const colorXMLPath = path.join(data.project.build_path, '.androidjs', 'res', 'values', 'colors.xml');

        // Get color from package.json
        const colors: {[key: string]:string } = pkg.color || {};

        // for previous version compatibility
        Object.assign(colors, {...pkg.theme||{}});
        delete colors.fullScreen

        let parser = new xml2js.Parser();
        let builder = new xml2js.Builder();

        let stylesData = fs.readFileSync(colorXMLPath);
        parser.parseString(stylesData, (error: any, document: {resources: {color: Array<{_:string, $: {name: string}}>}}) => {
            if(error) throw error

            document.resources.color = (document.resources.color).filter(x => colors[x.$.name] === undefined)

            for(const [key, value] of Object.entries(colors)) {
                document.resources.color.push({
                    _: value,
                    $: { name: key }
                })
            }

            const updated_document = builder.buildObject(document);
            fs.writeFileSync(colorXMLPath, updated_document);
        })

        this.next(data)
    }
}


// Set the app to fullscreen
class UpdateStyle extends Task {
    execute(data: any): void {
        logger.info(`${this.constructor.name}`)

        const pkg = require(path.join(context.project_dir, 'package.json'));
        const styleXMLPath = path.join(data.project.build_path, '.androidjs', 'res', 'values', 'styles.xml');
        const fullScreen = (pkg.theme || {}).fullScreen

        const stylesData = fs.readFileSync(styleXMLPath);
        const parser = new xml2js.Parser();
        const builder = new xml2js.Builder();

        parser.parseString(stylesData, (error: any, document: {resources: {style: Array<{$: {name: string, parent: string}, _?:string, item?:Array<{_: string, $: {name: string}}>}>}}) => {
            if(error) throw error

            document.resources.style = (document.resources.style).map(x => {
                if(x.item) {
                    x.item = x.item.map(y => {

                        // TODO: this class must provide interface to update styles.xml file
                        switch(y.$.name) {
                            case 'android:windowNoTitle':
                                logger.info(`Updating ${x.$.name}, ${y.$.name}, setting: ${fullScreen?'true':'true'}`)
                                if(fullScreen) return {...y, _: 'true'}
                                else return {...y, _: 'true'}

                            case 'android:windowFullscreen':
                                logger.info(`Updating ${x.$.name}, ${y.$.name}, setting: ${fullScreen?'true':'false'}`)
                                if(fullScreen) return {...y, _: 'true'}
                                else return {...y, _: 'false'}

                            default:
                                return y
                        }
                    })
                    return x
                }
                return x
            });

            const updated_document = builder.buildObject(document);
            fs.writeFileSync(styleXMLPath, updated_document);

        })

        this.next(data)
    }
}


// Copy update icons
class UpdateIcons extends Task {
    execute(data: any): void {
        logger.info(`${this.constructor.name}`)

        const pkg = require(path.join(context.project_dir, 'package.json'));
        const icon = pkg.icon

        if(!icon) {
            logger.warn('icon not defined in package.json')
            this.next(data)
            return
        }

        const iconPath = path.join(context.project_dir, icon)
        if(icon && !fs.existsSync(iconPath)) throw `Can not find icon ${iconPath}`

        const icon_paths: Array<string> = [];
        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-hdpi', 'ic_launcher.png'));
        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-hdpi', 'ic_launcher_round.png'));

        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-mdpi', 'ic_launcher.png'));
        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-mdpi', 'ic_launcher_round.png'));

        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-xhdpi', 'ic_launcher.png'));
        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-xhdpi', 'ic_launcher_round.png'));

        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-xxhdpi', 'ic_launcher.png'));
        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-xxhdpi', 'ic_launcher_round.png'));

        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png'));
        icon_paths.push(path.join(data.project.build_path, '.androidjs', 'res', 'mipmap-xxxhdpi', 'ic_launcher_round.png'));

        for(const i in icon_paths){
            fs.writeFileSync(icon_paths[i], fs.readFileSync(iconPath));
        }

        this.next(data)
    }
}

// Update app name
class UpdateAppName extends Task {
    execute(data: any): void {
        logger.info(`${this.constructor.name}`)

        const pkg = require(path.join(context.project_dir, 'package.json'));
        const app_name = pkg[`app-name`]
        const strings: {[key: string]: string} = {}

        // add app-name to be updated in strings
        strings.app_name = app_name

        if(!app_name) throw `Can not find app-name in package.json`

        logger.info(`Updating app name: ${app_name}`)

        const stringsXMLPath = path.join(data.project.build_path, '.androidjs', 'res', 'values', 'strings.xml');
        let parser = new xml2js.Parser();
        let builder = new xml2js.Builder();

        let stringsData = fs.readFileSync(stringsXMLPath);
        parser.parseString(stringsData, (error: any, document:{resources: {string: Array<{_:string, $: {name: string}}>}}) => {
            if(error) throw error

            document.resources.string = (document.resources.string).filter(x => strings[x.$.name] === undefined)

            for(const [key, value] of Object.entries(strings)) {
                document.resources.string.push({
                    _: value,
                    $: { name: key }
                })
            }

            const updated_document = builder.buildObject(document);
            fs.writeFileSync(stringsXMLPath, updated_document);
            this.next(data)
        })
    }
}

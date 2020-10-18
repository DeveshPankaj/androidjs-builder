# Addroidjs
### Platform to build fully featured android app Using Node JS.

## install from npm
```bash
$ sudo npm install -g androidjs-builder 
```
Since we have installed 'androidjs-builder' globally , it will provide all necessary commands build our app

## Generate new project
```bash
$ androidjs init

? Application name: myapp
```
This command will generate a basic structure for quick start

```text
 myapp
    |__ assets
    |       |__ ipc, css, js
    |
    |__ views
    |       |__ index.html
    |
    |__ main.js
    |__ package.json

```

- main.js is the main file or we can say it is back process of your app which execute all the code written in node, so you can write your node js code inside main.js
- index.html is the first view which is render by app initially
- package.json to keep track of all your node packages
- assets to store all assets of your app



## Build project
```bash
$ cd myapp
$ androidjs build

or
$ androidjs b
```
it will create apk inside ``./myapp/dist/``

build and install uses system 'adb' command.

## Update androidjs-sdk
```bash
$ androidjs update

or
$ androidjs u
```

## FullScreen Activity
```json
package.json
{
    ...
    ...
    "theme": {
        "fullScreen": true,
        "colorAccent": "@color/colorAccent",
        "colorPrimary": "@color/colorPrimary",
        "colorPrimaryDark": "@color/colorPrimaryDark"
    }
    ...
}
```


## Other examples
Download from [github](https://github.com/android-js/sample-app)


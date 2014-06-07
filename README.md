# Overview
tx2manifest is a utility to help in i18n of FirefoxOS apps which adhere to the design pattern described in [this article](https://developer.mozilla.org/en-US/Apps/Build/Localization/App_Localization_with_Transifex).
The goals of the project are modest: implement something useful to me as a FirefoxOS developers while exploring node.js, Promises and q-io (which are amazing tools by the way).

#Installation
As root, type
```
  npm install -g tx2manifest
```

#Usage
In the root directory of your app, type:
```
  tx2manifest -h # To get usage
  tx2manifest    # If the default options suit you 
```
The command does not modify any files, it simply prints the updated manifest to the console.

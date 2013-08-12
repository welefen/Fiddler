* prototype from [chrome-screen-capture](http://chrome-screen-capture.googlecode.com/svn/trunk/src/plugin)

## Summary

现阶段主要功能是，弹出系统文件选择框，用户通过选择、确定后，将所选文件或文件夹路径返回

## Methods

`var path = plugin.GetFilePath(initial_path, dialog_title);`

> 弹出文件选择框

* `initial_path` 是文件选择框的初始位置
* `dialog_title` 是文件选择框上方的标题
* `path` 是用户所选文件的路径

`var path = plugin.GetFolderPath(initial_path, dialog_title);`

> 弹出文件夹选择框

* `initial_path` 是文件夹选择框的初始位置
* `dialog_title` 是文件夹选择框上方的标题
* `path` 是用户所选文件夹的路径

`var path = plugin.OpenFileDialog(initial_path, option)`
<span style="background-color:#ccf;border:1px solid blue;">deprecated<span>

> 此方法是上面两个方法的结合，缺点在于不能对文件选择框的标题进行设置。
> 由于前期方法名字起的不好，没准哪天心情不好就去除了，所以标记不建议使用了。

* `initial_path` 是文件或文件夹选择框的初始位置
* `option` 是 `"file"` 则打开文件选择框，是 `"path"` 则打开文件夹选择框
* `path` 是用户所选文件夹的路径

## Example

Mac OSX 下的文件 [chrome_fiddler.plugin](https://github.com/welefen/Fiddler/tree/master/plugin/chrome_fiddler.plugin)    
Windows 下的文件 [chrome_fiddler.dll](https://github.com/welefen/Fiddler/blob/master/plugin/chrome_fiddler_vs2008_project/Release/chrome_fiddler.dll)    
type 为 `application/x-chromefiddler`

    <!doctype html>
    <html>
        <head>
            <script>
                window.onload = function(e) {
                    var plugin = document.getElementById("chromefiddler");
                };
            </script>
        </head>
        <body>
            <embed id="chromefiddler" type="application/x-chromefiddler">
        </body>
    </html>


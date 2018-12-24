## CLI

初始化

maishu-image-server init

启动

maishu-image-service start 

## 接口


1.  上传图片

    /upload

    参数

    ```js
    {
        image: string,  // 要上传图片的 base64 字符串
        width: number,  // 图片宽度
        height: number, // 图片高度
    }
    ```

    返回值

    ```js
    { id: string }
    ```

1. 获取图片

    /image

    参数

    ```js
    {
        id: string,     // 要获取图片的编号
        width?: number, // 图片的宽度
        height?: number, // 图片的宽度
    }
    ```

    * 如果指定 widht 和 heigt，则图片缩放为指定的宽度和高度

    * 如果指定 width，则图片缩放为指定的宽度，高度按比例调整

    * 如果指定 height，则图片缩放为指定的高度，宽度按比例调整
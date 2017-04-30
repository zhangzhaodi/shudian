//1.引入需要依赖模块
const http = require('http');
const fs =require('fs');
const url = require('url');
const mime = require('mime');
//6.读取方法
function readBook(callback){
    //6.1读取json 回掉
    fs.readFile('./book.json','utf8',function(err,data){
        if(err || data == ''){ //6.2 判断json 失败或者空  返回一个空对象
            callback([]);
        }else{   //6.3  不是 json转对象返回
            callback(JSON.parse(data))
        }
    })
}
//7.写入方法
function writeBook(data,callback){
    //7.1 写入json  并把对象转json格式    res.end在callback里执行
    fs.writeFile('./book.json',JSON.stringify(data),callback);
}
//2.创建服务器  监听端口
http.createServer(function(req,res){  //req服务器接收  res响应客户端
    //3.url pathname获取所有目录文件   query？？？
    let {pathname,query} = url.parse(req.url,true);
    //4.后台配置路由
    if(pathname == '/'){  // 4.1 /根目录
        res.setHeader('Content-Type','text/html;charset=utd8'); //4.2 向客户端相应头部
        fs.createReadStream('./index.html').pipe(res);  //4.3  读取index 用管道pipe 写入到res 相应给客户端
    }else if(/^\/book(?:\/(\d+))?$/.test(pathname)){  //8.匹配路径
        //8.1 有id获取id  没有获取的是 undefined
        var id = /^\/book(?:\/(\d+))?$/.exec(pathname)[1];
        //8.2交互方法
        switch(req.method){
            case 'GET':
                        if (id){  //11.客户端请求的id
                            readBook(function(books){
                                //通过id找到对应的数据
                                //find 查找book.json里的数据
                                var b = books.find(function(book){
                                    return id == book.id; //对应id的数据返回给books
                                });
                        //把对应的数据响应给客户端
                        res.end(JSON.stringify(b))
                    })
                }else{
                    //9.读取book.json 并响应给客户端
                    readBook(function(data){
                        res.end(JSON.stringify(data));
                    })
                }
                break;
            case 'POST':
                //10.接收前台list form请求体
                str = '';
                req.on('data',function(data){  //10.1 on（‘data’，） 为请求体响应到服务器的数据
                    str +=data ;  //拼接字符串
                });
                req.on('end',function(){  //10.2 end 请求提相应完成
                    var book = JSON.parse(str);  //转对象
                    readBook(function(books){  //读取
                        //设置读取到的数据的 id
                        book.id = books.length == 0?1:books[books.length-1].id+1;
                        books.push(book); //添加到from请求体的数据里
                        //将books数据 写入到 book.json
                        writeBook(books,function(){
                            //把数据响应到客户端
                            res.end(JSON.stringify(book))//end只能写字符串
                        })
                    })
                });
                break;
            case 'PUT':
                if (id){
                    var str ='';
                    req.on('data',function(books){
                        str += books;
                    });
                    req.on('end',function(){
                        var p = JSON.parse(str);
                        readBook(function(books){
                            books = books.map(function(item){  //映射 修改
                                if (item.id == id){
                                    return p;
                                }
                                return item;
                            });
                            writeBook(books,function(){
                                res.end(JSON.stringify(p))
                            })
                        })
                    })
                }
                break;
            case 'DELETE':
                //11.接受前台 delete 请求体
                if(id){   //请求体id
                    //11.1读取
                    readBook(function(books){
                        //通过过滤器 删除
                        books = books.filter(function(book){
                            //当前id不等id（false）  返回false 回删除
                            return id != book.id;
                        });
                        //写入一个空对象
                        writeBook(books,function(){
                            res.end(JSON.stringify({}))
                        })
                    })
                }
                break;
        }
    }else{ //5. 如果路径不是文件里的路径 相应客户端404
        fs.exists('.'+pathname,function(flag){ //5.1 exists查找路径有无 返回true/false  ？？？
            if(flag){  //5.2 如果有     mimelookup(文件名)自动匹配文档类型
                res.setHeader('Content-Type',mime.lookup(pathname)+';charset=utf8');
                fs.createReadStream('.'+pathname).pipe(res) // 读取 写入
            }else{
                //5.3 如果没有
                res.statusCode = 404;  //404编码
                res.end('Not found!');   //结束 并响应给客户端 Not found!
            }
        })
    }
}).listen(8080,function(){
    console.log('run  8080 ')
});

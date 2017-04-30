//1.定义控制器
angular.module('appModule.controller',[])
    .controller('homeCtrl',function($scope){
        $scope.home = 'hello'
    })
    .controller('addCtrl',function($scope,book,$location){
        //3.点击btn 添加到book.json 数据里
        $scope.add = function () {
            //save是$resource带的增/删/改/查方法的增方法  对应POST
            //向服务器发送数据  命名为book
            book.save($scope.book).$promise.then(function(){
                //promise方法  保存成功跳转到列表页
                //路由中提供了一个跳转的服务 $location
                $location.path('/list')
            })
        }
    })
    .controller('listCtrl',function($scope,book){
        //2.读取book.json数据  循环渲染在list模块
        $scope.books = book.query(); //query()获取GET请求 所有内容
    })
    .controller('detailCtrl',function($scope,book,$routeParams,$location){
        //4.获取id的值去服务端查询
        //$routeParams  可以回去url id
        //$routeParams  获取一个对象{id:3}
        var id= $routeParams.id;
        $scope.book = book.get({id:id});   //根据id 通过get向服务端获取这本书的数据


        //5.定义详情页
        $scope.flag=true;  //声明一个变量切换
        //5.1删除操作
        $scope.remove = function (){
            book.delete({id:id}).$promise.then(function(){ //通过服务book delete方法交互服务器
                $location.path('/list');  //peomise 成功跳转list页面
            })
        };

        //5.2修改操作
        $scope.changeFlag = function (){
            //当点击修改时  给temp赋值  book克隆一份 -》 temp
            console.log($scope.book);
            $scope.temp = JSON.parse(JSON.stringify($scope.book));
            $scope.flag = false;  //ng-show切换
        };
        //5.3修改确认
        $scope.sure = function () {
            book.update({id:id},$scope.temp).$promise.then(function(){
                //变成不可输入状态再将book改成最新数据
                $scope.flag = true;
                $scope.book = $scope.temp;
            })
        }

    });

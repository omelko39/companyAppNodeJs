var app = angular.module('App', []);

app.
    controller('Main', function ($scope, $http) {
        $scope.cr = false;
        $scope.pl = false;
        $http.get('/list').then(function (res) {
            $scope.list = res.data;
        })
        $scope.getList = function() {
            $http.get('/list').then(function (res) {
                $scope.list = res.data;
            })
        }

        $scope.create = function(parentId, obj) {
            if(parentId == undefined){
                obj.parent = true;
            } else {
                obj.parentId = parentId;
                obj.parent = false;
            }

            $http.post('/create', obj).then(function(res){
                $scope.getList();
            });
        }

        $scope.update = function(obj) {
            $http.post('/update', obj).then(function(res){
                $scope.getList()
            })
        }

        $scope.delete = function(id){
            $http.get('/delete/' + id).then(function(res){
                $scope.getList();
            })
        }

    });

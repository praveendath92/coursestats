/**
 * Created by praveen on 22.08.15.
 *
 * Handles Register related operations
 */

angular.module('ContributeApp').controller('RegisterCtrl', function ($scope, config, $http, md5) {
    $scope.registering = 0;
    $scope.registerError = null;
    $scope.registerMsg = null;

    // Register object
    $scope.register = {
        fullname: null,
        email: null,
        password: null,
        repassword: null
    };

    $scope.registerUser = function() {
        $scope.registerMsg = null;
        $scope.registerError = null;

        if(!($scope.register.fullname && $scope.register.email
            && $scope.register.password && $scope.register.repassword)) {
            $scope.registerError = 'All fields are required';
            return;
        }


        if($scope.register.password != $scope.register.repassword){
            $scope.registerError = 'Passwords do not match';
            return;
        }

        $scope.registering = 1;

        // Build a register request
        var req = {
            method: 'GET',
            url: config.apiUrl + '/student/register?'
            + 'fullname=' + $scope.register.email
            + '&email=' + $scope.register.email
            +'&password=' + md5.createHash($scope.register.password)
        };

        // Send it
        $http(req)
            .then(
            function(response){ // Success callback
                $data = response.data;
                if($data.responsecode == 200){
                    $scope.registerError = null;
                    $scope.registerMsg = "Registered! Wait for admin's approval.";

                    // Empty fields
                    $scope.register.email = null;
                    $scope.register.fullname = null;
                    $scope.register.password = null;
                    $scope.register.repassword = null;
                } else{
                    $scope.registerError = $data.message;
                }
                $scope.registering = 0;
            },
            function(response){ //Error callback
                $scope.registerError = response.toString();
                $scope.registering = 0;
            }
        );
    };
});

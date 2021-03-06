/**
 * Created by praveen on 25.08.15.
 */

angular.module('UserApp').controller('GradeCtrl', function($scope, config, $http, $location) {
    $scope.mode = {
        value: 1,
        options:{
            TEACHER: 1, COURSE: 2
        }
    };
    $scope.ready = 0;

    // Find out the mode and id
    var path = $location.path();
    if(path.indexOf('/course/') > -1)
        $scope.mode.value = $scope.mode.options.COURSE;
    $scope.id = path.substr(path.lastIndexOf('/') + 1, path.length);
    $scope.grades = [];

    function buildGrades(gradesResp){
        for(i=0; i<gradesResp.length; i++){
            grade = gradesResp[i];

            displayGrade = {
                "table" : [
                    {
                        key: "grade10",
                        display: "1.0",
                        value: grade.grade_10
                    },
                    {
                        key: "grade13",
                        display: "1.3",
                        value: grade.grade_13
                    },
                    {
                        key: "grade17",
                        display: "1.7",
                        value: grade.grade_17
                    },
                    {
                        key: "grade20",
                        display: "2.0",
                        value: grade.grade_20
                    },
                    {
                        key: "grade23",
                        display: "2.3",
                        value: grade.grade_23
                    },
                    {
                        key: "grade27",
                        display: "2.7",
                        value: grade.grade_27
                    },
                    {
                        key: "grade30",
                        display: "3.0",
                        value: grade.grade_30
                    },
                    {
                        key: "grade33",
                        display: "3.3",
                        value: grade.grade_33
                    },
                    {
                        key: "grade37",
                        display: "3.7",
                        value: grade.grade_37
                    },
                    {
                        key: "grade40",
                        display: "4.0",
                        value: grade.grade_40
                    },
                    {
                        key: "grade50",
                        display: "5.0",
                        value: grade.grade_50
                    },
                    {
                        key: "gradeothers",
                        display: "Others",
                        value: grade.grade_others
                    }
                ],
                graph: {
                    "data": [[
                        parseInt(grade.grade_10), parseInt(grade.grade_13), parseInt(grade.grade_17),
                        parseInt(grade.grade_20), parseInt(grade.grade_23), parseInt(grade.grade_27),
                        parseInt(grade.grade_30), parseInt(grade.grade_33), parseInt(grade.grade_37),
                        parseInt(grade.grade_40), parseInt(grade.grade_50), parseInt(grade.grade_others)
                    ]]
                },
                original: grade
            };
            $scope.grades.push(displayGrade);
            $scope.graph.overviewData.push(displayGrade.graph.data[0]);
            $scope.graph.series.push(
                grade.coursename + " (" + grade.courseyear + " " + ((grade.coursesem==1)?'Summer':'Winter') + ")");
        }
        $scope.graph.overviewShow = (gradesResp.length > 1) ? 1 : 0;
    }

    // Get grades
    var urloption = ($scope.mode.value == $scope.mode.options.TEACHER) ? "teacherid" : "courseid";
    var req = {
        method: 'GET',
        url: config.apiUrl + '/grade/search?' + urloption + '=' + $scope.id
    };
    $http(req)
        .then(
        function(response){ // Success callback
            buildGrades(response.data.grades);
            $scope.ready = 1;
        },
        function(response){ //Error callback
            console.log(response.toString());
        }
    );

    $scope.graph = {
        labels : ["1.0", "1.3", "1.7", "2.0", "2.3", "2.7", "3.0", "3.3", "3.7", "4.0", "5.0"],
        getData : function (grade){
            return grade.graph.data;
        },
        overviewData: [],
        series: [],
        overviewShow: 0
    };

    $scope.stats = {
        gradeSum: function(grade){
            var count = 0;
            for(i=0; i<grade.graph.data[0].length-1; i++)
                count += grade.graph.data[0][i];
            return count;
        },
        mean: function (grade) {
            var wSum = grade.graph.data[0][0] * 1.0 + grade.graph.data[0][1] * 1.3 + grade.graph.data[0][2] * 1.7
                + grade.graph.data[0][3] * 2.0 + grade.graph.data[0][4] * 2.3 + grade.graph.data[0][5] * 2.7
                + grade.graph.data[0][6] * 3.0 + grade.graph.data[0][7] * 3.3 + grade.graph.data[0][8] * 3.7
                + grade.graph.data[0][9] * 4.0 + grade.graph.data[0][10] * 5.0;
            return (wSum / $scope.stats.gradeSum(grade)).toPrecision(4);
        },
        percent: function(value, grade){
            return (100 * parseInt(value) / $scope.stats.gradeSum(grade)).toPrecision(3);
        },
        failRate: function (grade) {
            return $scope.stats.percent(parseInt(grade.original.grade_50), grade);
        },
        oneToTwo: function (grade) {
            var sum = parseInt(grade.original.grade_10) + parseInt(grade.original.grade_13)
                + parseInt(grade.original.grade_17);
            return $scope.stats.percent(sum, grade);
        },
        twoToThree: function (grade) {
            var sum = parseInt(grade.original.grade_20) + parseInt(grade.original.grade_23)
                + parseInt(grade.original.grade_27);
            return $scope.stats.percent(sum, grade);
        },
        threeToFour: function (grade) {
            var sum = parseInt(grade.original.grade_30) + parseInt(grade.original.grade_33)
                + parseInt(grade.original.grade_37);
            return $scope.stats.percent(sum, grade);
        },
        fourToFive: function (grade) {
            var sum = parseInt(grade.original.grade_40) + parseInt(grade.original.grade_50);
            return $scope.stats.percent(sum, grade);
        }
    };

    // Ratings related
    $scope.params = {
        stars : [1, 2, 3, 4, 5],
        getRounded: function(value){
            var val = parseFloat(value);
            if(val){
                if(val < 0.75)
                    return 0.5;
                else if (val < 1.25)
                    return 1.0;
                else if (val < 1.75)
                    return 1.5;
                else if (val < 2.25)
                    return 2.0;
                else if (val < 2.75)
                    return 2.5;
                else if (val < 3.25)
                    return 3.0;
                else if (val < 3.75)
                    return 3.5;
                else if (val < 4.25)
                    return 4.0;
                else if (val < 4.75)
                    return 4.5;
                else if (val <= 5)
                    return 5.0;
            }
            else {
                return 0;
            }
        },
        getClass: function(index, selected){
            var value = $scope.params.getRounded(selected);

            // Integer and decimal parts of value seperated
            var valInt = Math.floor(value);
            var valDec = value - valInt;

            // Safe case. Example: For 2 or 2.5, this is 4 & 5. 3rd star could be half fill.
            if(index > valInt+1) {
                return 'fa-star-o';
            }
            else {
                // For positions 1 and 2 in above example.
                if(index <= valInt)
                    return 'fa-star ' + $scope.params.getStarColor(valInt);

                // Only position 3 left in above example
                else{
                    if(valDec == 0)
                        return 'fa-star-o';
                    else
                        return 'fa-star-half-o ' + $scope.params.getStarColor(valInt);

                }
            }
        },
        getStarColor: function(value){
            switch (value){
                case 1:
                    return 'star-1';
                case 2:
                    return 'star-2';
                case 3:
                    return 'star-3';
                case 4:
                    return 'star-4';
                case 5:
                    return 'star-5';
            }
        },
        getHint: function(selected){
            var value = $scope.params.getRounded(selected);

            switch (value){
                case 0:
                    return 'Unrated';
                case 1:
                case 1.5:
                    return 'Very hard';
                case 2:
                case 2.5:
                    return 'Hard';
                case 3:
                case 3.5:
                    return 'Moderate';
                case 4:
                case 4.5:
                    return 'Easy';
                case 5:
                    return 'Very easy';
            }
        }
    };
});

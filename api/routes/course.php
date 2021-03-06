<?php

/**
 * Author	: Praveen Kumar Pendyala (m@praveen.xyz)
 * Created	: 21.08.2015
 *
 * These are the list of actions / api calls for course actions
 */

$app->group('/course', function () use ($app, $db, $checkToken) {

    //################## Add Course  ##################
    $app->map('/add', $checkToken, function () use ($app, $db) {
        $userid = $app->request->headers->get("studentid");
        $name = $app->request->get('name');
        $year = $app->request->get('year');
        $sem = $app->request->get('sem');
        $tucanid = $app->request->get('tucanid');
        $teacherid = $app->request->get('teacherid');

        if(!$tucanid || $tucanid == "")
            $tucanid = "NA";

        try {
            $stmt = $db->prepare('SELECT courseid, name, year, semester FROM courses WHERE name=?');
            $stmt->execute(array(utf8_encode($name)));
            $dbCourses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $newCourseid = 0;
            $error = null;

            // Normal insert of completely new course
            if(!$dbCourses){
                $stmt2 = $db->prepare('INSERT INTO courses (`name`, `teacherid`, `year`, `semester`, `tucanid`, `addedby`)
                                   VALUES (?, ?, ?, ?, ?, ?)');
                $stmt2->execute(array(utf8_encode($name), $teacherid, $year, $sem, $tucanid, $userid));
                $newCourseid = $db->lastInsertId();

                // Updated linkedid to self
                $stmt3 = $db->prepare('UPDATE courses SET linkedid=? WHERE courseid=?');
                $stmt3->execute(array($newCourseid, $newCourseid));
                $error = $stmt3->errorInfo();
            }

            // Similar course already in db
            else {
                // Check for a possible duplicate. Report success if already exists!
                $linkedid = $dbCourses[0]['courseid'];
                foreach($dbCourses as $dbCourse)
                    if($dbCourse['year'] == $year && $dbCourse['semester'] == $sem){
                        ApiResponse::success(200, "success", "courseid", $dbCourse['courseid']);
                        $app->stop();
                    }

                // Insert a course with linkedid to existing course
                $stmt2 = $db->prepare('INSERT INTO courses (`name`, `teacherid`, `year`, `semester`, `tucanid`, `addedby`,
                                      `linkedid`) VALUES (?, ?, ?, ?, ?, ?, ?)');
                $stmt2->execute(array(utf8_encode($name), $teacherid, $year, $sem, $tucanid, $userid, $linkedid));
                $newCourseid = $db->lastInsertId();
                $error = $stmt2->errorInfo();
            }

            if($newCourseid)
                ApiResponse::success(200, "success", "courseid", $newCourseid);
            else
                ApiResponse::error(500, $error);

        } catch (PDOException $ex) {
            ApiResponse::error(500, "Internal server error");
        }
    })->via('GET', 'POST');

    //################## List Courses  ##################
    $app->map('/list', function() use ($app, $db) {
        try{
            $stmt = $db->prepare('SELECT * FROM courses LIMIT 50');
            $stmt->execute();
            ApiResponse::success(200, "success", "courses", $stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch(PDOException $ex){
            ApiResponse::error(500, "Internal server error");
        }
    })->via('GET', 'POST');

    //################## Search Courses  ##################
    $app->map('/search', function() use ($app, $db) {
        $query = $app->request->get('q');
        try{
            $stmt = $db->prepare('SELECT * FROM courses WHERE name LIKE ? LIMIT 10');
            $stmt->execute(array("%$query%"));
            ApiResponse::success(200, "success", "courses", $stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch(PDOException $ex){
            ApiResponse::error(500, "Internal server error");
        }
    })->via('GET', 'POST');

});

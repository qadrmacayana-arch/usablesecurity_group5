<?php
session_start();
if (!empty($_SESSION['role'])) {
    if ($_SESSION['role'] === 'administrator') {
        header('Location: admin/admin-dashboard.php');
        exit;
    }
    if ($_SESSION['role'] === 'student') {
        header('Location: student/dashboard.php');
        exit;
    }
}
header('Location: auth/login.php');
exit;

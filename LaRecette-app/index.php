<?php
$request = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($request, PHP_URL_PATH) ?: '/';
$viewDir = '/views/public/';

switch ($path) {
    case '':
    case '/':
        require __DIR__ . $viewDir . 'home.php';
        break;

    case '/menu':
        require __DIR__ . $viewDir . 'menu.php';
        break;

    case '/classiques':
        require __DIR__ . $viewDir . 'classiques.php';
        break;

    case '/commander':
        require __DIR__ . $viewDir . 'commander.php';
        break;

    case '/entremets':
        require __DIR__ . $viewDir . 'entremets.php';
        break;

    case '/gateaux-a-themes':
        require __DIR__ . $viewDir . 'gateaux-a-themes.php';
        break;

    case '/mignardises':
        require __DIR__ . $viewDir . 'mignardises.php';
        break;

    case '/number-cakes':
        require __DIR__ . $viewDir . 'number-cakes.php';
        break;

    case '/traiteur':
        require __DIR__ . $viewDir . 'traiteur.php';
        break;

    case '/cgv':
        require __DIR__ . $viewDir . 'cgv.php';
        break;

    case '/cgu':
        require __DIR__ . $viewDir . 'cgu.php';
        break;

    case '/mentions-legales':
        require __DIR__ . $viewDir . 'mentions-legales.php';
        break;
    case '/account':
        require __DIR__ . $viewDir . 'account.php';
        break;

    case '/send_cart':
        require __DIR__ . '/scripts/send_cart.php';
        break;
        
    default:
        http_response_code(404);
        require __DIR__ . $viewDir . '404.php';
        break;
}

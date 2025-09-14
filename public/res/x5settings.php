<?php

/*
|-------------------------------
|	GENERAL SETTINGS
|-------------------------------
*/

$imSettings['general'] = array(
	'url' => 'http://zanellazen.altervista.org/',
	'homepage_url' => 'http://zanellazen.altervista.org/home.php',
	'icon' => 'http://zanellazen.altervista.org/admin/images/logo_zi86vue4.png',
	'version' => '13.1.8.23',
	'sitename' => 'Zanellazen',
	'public_folder' => '',
	'salt' => 'xohrf9m2n2szu2u0bmo8xh1kl1er97pvw2c8ez74vb4as50g3kehi72gmx6duvt',
	'use_common_email_sender_address' => false,
	'common_email_sender_addres' => ''
);


$imSettings['admin'] = array(
	'icon' => 'admin/images/logo_zi86vue4.png',
	'theme' => 'orange'
);


/*
|--------------------------------------------------------------------------------------
|	DATABASES SETTINGS
|--------------------------------------------------------------------------------------
*/

$imSettings['databases'] = array();
$ecommerce = Configuration::getCart();
$ecommerce->setSettings(array(
	'force_sender' => false,
	'email_opening' => 'Gentile Cliente,<br /><br />Ringraziandola per il Suo acquisto le inviamo il riepilogo del suo Ordine.<br /><br />Qui di seguito può trovare l\'elenco dei prodotti ordinati, i dati di fatturazione e le istruzioni per la spedizione ed il pagamento scelto.',
	'email_closing' => 'Rimaniamo a Sua disposizione per ulteriori informazioni.<br /><br />Cordiali Saluti, Staff Commerciale.',
	'useCSV' => true,
	'header_bg_color' => '#253A58',
	'header_text_color' => '#FFFFFF',
	'cell_bg_color' => '#FFFFFF',
	'cell_text_color' => '#000000',
	'border_color' => '#D3D3D3',
	'owner_email' => 'szanella68@gmail.com',
	'vat_type' => 'none'
));


/*
|-------------------------------------------------------------------------------------------
|	GUESTBOOK SETTINGS
|-------------------------------------------------------------------------------------------
*/

$imSettings['guestbooks'] = array(
	'x5gb02' => array(
		'id' => 'x5gb02',
		'pagetitle' => 'Home Page',
		'celltitle' => '',
		'rating' => FALSE,
		'order' => 'desc', 
		'sendmode' => 'file',
		'folder' => '/commenti',
	),
	'x5gb344' => array(
		'id' => 'x5gb344',
		'pagetitle' => 'Dialetto feltrino',
		'celltitle' => '',
		'rating' => TRUE,
		'order' => 'desc', 
		'sendmode' => 'file',
		'folder' => '/commenti',
	)
);

/*
|-------------------------------
|	EMAIL SETTINGS
|-------------------------------
*/

$ImMailer->emailType = 'phpmailer';
$ImMailer->header = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">' . "\n" . '<html>' . "\n" . '<head>' . "\n" . '<meta http-equiv="content-type" content="text/html; charset=utf-8">' . "\n" . '<meta name="generator" content="Incomedia WebSite X5 v13 - www.websitex5.com">' . "\n" . '</head>' . "\n" . '<body bgcolor="#708090" style="background-color: #708090;">' . "\n\t" . '<table border="0" cellpadding="0" align="center" cellspacing="0" style="padding: 0; margin: 0 auto; width: 700px;">' . "\n\t" . '<tr><td id="imEmailContent" style="min-height: 300px; padding: 10px; font: normal normal normal 9pt \'Tahoma\'; color: #000000; background-color: #FFFFFF; text-align: left; text-decoration: none;  width: 700px;border-style: solid; border-color: #808080; border-top-width: 1px; border-right-width: 1px; border-bottom-width: 0; border-bottom: none; border-left-width: 1px;background-color: #FFFFFF" width="700px">' . "\n\t\t";
$ImMailer->footer = "\n\t" . '</td></tr>' . "\n\t" . '<tr><td id="imEmailFooter" style="font: normal normal normal 7pt \'Tahoma\'; color: #000000; background-color: transparent; text-align: center; text-decoration: none;  width: 700px;border-style: solid; border-color: #808080; border-top-width: 0; border-top: none; border-right-width: 1px; border-bottom-width: 1px; border-left-width: 1px; padding: 10px; background-color: #FFFFFF" width="700px">' . "\n\t\t" . 'Questo messaggio di posta elettronica contiene informazioni rivolte esclusivamente al destinatario sopra indicato.<br>Nel caso aveste ricevuto questo messaggio di posta elettronica per errore, siete pregati di segnalarlo immediatamente al mittente e distruggere quanto ricevuto senza farne copia.' . "\n\t" . '</td></tr>' . "\n\t" . '</table>' . "\n" . '</body>' . "\n" . '</html>';
$ImMailer->bodyBackground = '#FFFFFF';
$ImMailer->bodyBackgroundEven = '#FFFFFF';
$ImMailer->bodyBackgroundOdd = '#F0F0F0';
$ImMailer->bodyBackgroundBorder = '#CDCDCD';
$ImMailer->bodySeparatorBorderColor = '#000000';
$ImMailer->emailBackground = '#708090';
$ImMailer->emailContentStyle = 'font: normal normal normal 9pt \'Tahoma\'; color: #000000; background-color: #FFFFFF; text-align: left; text-decoration: none; ';
$ImMailer->emailContentFontFamily = 'font-family: Tahoma;';
ImTopic::$captcha_code = "		<div class=\"x5captcha-wrap\">
			<label>Parola di controllo:</label><br />
			<input type=\"text\" class=\"imCpt\" name=\"imCpt\" maxlength=\"5\" />
		</div>
";

// End of file x5settings.php
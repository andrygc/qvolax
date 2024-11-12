# Qvolax

Technologies used for the development: html5, css3, bootstrap, javascript, jquery, php and mysql.

### Requirements

- PHP version 5.3 or newer is recommended.
- A database (MySQL)

### Get the source code

```bash
git clone https://github.com/andrygc/qvolax.git
cd qvolax
```

### Create database tables

Qvolax supports [MySQL](https://www.mysql.com/).
Create a database for Qvolax and install the tables with the included scripts.

```bash
mysql -u username -p databasename < database/schema.mysql.sql
```

### Configure database details

Go to the _include_ directory, open config.php file, and set database detail as follow:

```bash
$db = mysqli_connect('<HOST>', '<USER_NAME>', '<PASSWORD>', '<DATABASE_NAME>');
```

### Open application in browser

Through the terminal in the project folder execute the command

```bash
php -S localhost:8000
```

Open from browser at http://localhost:8000

## Getting updates

To get the latest features, simply do a pull:

```bash
git pull
```


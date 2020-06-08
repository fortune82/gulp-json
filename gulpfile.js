// В дальнейшем, для запуска процесса слежения вводим команду "gulp"

// Уточнения. 
// Папка проекта не должна называться gulp
// Запускать можно и отдельные функции, например gulp css
// У кого копирует в dist только .jpg попробуйте немного изменить запись форматов с /*.{jpg, png, svg, gif, ico, webp} на /*.+(png|jpg|gif|ico|svg|webp)
// Для WEBP - CSS следует использовать настройки: webpcss({
//             webpClass: '.webp',
//             noWebpClass: '.no-webp'
//         }
// WEBP - CSS выдает ошибку если в названии файла картинки есть пробелы и / или кириллица

// Решение проблем:
// npm cache clean --force (очистака npm)
// npm i npm -g (установка npm) глобально на комп


let project_folder = 'dist'; //переманная - папка для заказчика
let source_folder = '#src'; //переменная - папка с исходниками
let path = { //переменная, кoторая содержит объекты, которые сожержат пути к файлам и папкам
    build: { // пути вывода, куда gulp будет выгружть готовые файлы
        html: project_folder + "/", //этоn слеш указывает место файла относительно файла index.html
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/"
    },
    src: { // пути откуда gulp будет брать файлы с исходниками 
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], //"!"+source_folder + "/_*.html" это исключение, чтоб в папку dist не попадали отдельные файлы, такие как, _header.html, _footer.html
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}", // ** - указываем что брать из любых папок внутри папки img, * - любое название файла, {расширения файлов}
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: { // пути к файлам, котороые необходимо "слушать" (сканировать) постоянно и что-то сними "налету" выполнять
        html: source_folder + "/**/*.html", // слушаем все, что имеет расширение html 
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/" // объект, который содержит путь к папке проекта. Он отвечает за удаление этой папки каждый раз, когда мы запускаем gulp 
}

let {
    src,
    dest
} = require('gulp'); // переменная которой присвоен сам gulp 
let gulp = require('gulp'); // переменная для выполненния каких-то отдельных задач
let browsersync = require('browser-sync').create(); // переменной присваиваем расширение browser sync, которое делает синхронизацию браузера 
let fileinclude = require('gulp-file-include'); // переменной присваиваем расширение, которое собирает в один файл все отдельные файлы (footer.html, header.html и т.п.). Для это в файле html в body пишем @@include("header.html" или другой). Подробнее на сайте плагина
let del = require('del'); // переменной присваиваем расширение, которое очищает из папки dist ненужные файлы
let scss = require('gulp-sass'); // переменной присваиваем расширение gulp-sass, которое обрабатывает scss файлы в css 
let autoprefixer = require('gulp-autoprefixer'); //переменной 'autoprefixer' присваиваем расширение, которое добавляет вендорные префиксы 
let group_media = require("gulp-group-css-media-queries"); //переменной 'group_media' присваиваем расширение, которое собирает в одно место (сортирует) все наши медиа запросы
let clean_css = require('gulp-clean-css'); // чистит и сжимает наш css файл на выходе
let rename = require('gulp-rename') // создает 2 файла (один сжатый css, а другой нет)



function browserSync(params) { // функция, которая будет обновлять нашу страницу. Название должно отличаться от переменной
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/" // базовая папка
        },
        port: 3000, // порт по которому будет открываться браузер
        notify: false // чтоб не открываласть табличка по умолчанию, что браузер обновился
    })
}

function html() { // функция для работы с html файлами 
    return src(path.src.html) // возвращает путь к исходным файлам (см. выше let path - src - html)
        .pipe(fileinclude()) // перед тем, как обращаемся к исходникам и подальшей их выгрузкой мы просим наш gulp наши файлы собирать 
        .pipe(dest(path.build.html)) //переброска файлов из папки с исходниками в папку для заказчика (если папки отсутствуют, то они будут созданны автоматически).  pipe - это функция в которой мы пишем те или иные команды для gulp 
        .pipe(browsersync.stream()) //функция чтоб браузер обновил страницу
}

function css() { // функция для работы с css файлами 
    return src(path.src.css) // возвращает путь к исходным файлам (см. выше let path - src - css)
        // .pipe(fileinclude()) // он нам не нужен, т.к. css итак может сам подключать файлы 
        .pipe( // обрабатывает sass файлы в css 
            scss({
                outputStyle: "expanded" //чтоб файлы преобразовывались в удобочитаемы css. Если укахать "compressed", то он их будет сжимать
            })
        )
        .pipe(group_media()) // сортировка media запросов
        .pipe(autoprefixer({ //добавляем вендорные префиксы
            overrideBrowserlist: ['last 5 version'], // количество последних версий браузеров, для которых добавлять префиксы
            cascade: true // стиль написания префиксов
        }))
        .pipe(dest(path.build.css)) // т.к. у нас два файла создаються (один сжатый (см. ниже), а другой нет,то мы до того как наш файл будет сжиматься и переименовываться мы его выгрузим (т.е. у нас получается 2 выгрузки)
        .pipe(clean_css())
        .pipe(rename({ // создаем два файла один из которых сжатый
            extname: ".min.css" // в файле index.html подключаем файл style.min.css вместо style.css
        }))
        .pipe(dest(path.build.css)) //переброска файлов из папки с исходниками в папку для заказчика (если папки отсутствуют, то они будут созданны автоматически).  pipe - это функция в которой мы пишем те или иные команды для gulp 
        .pipe(browsersync.stream()) //функция чтоб браузер обновил страницу
}



function watchFiles(params) { // функция, которая работает как расширения live server (отображает изменения на лету)
    gulp.watch([path.watch.html], html); // путь слежения. html после запятой - это функция(см. выше)
    gulp.watch([path.watch.css], css); // путь слежения. css после запятой - это функция(см. выше)
}

function clean(params) { // функция которая чистит папку
    return del(path.clean); // путь к нашей папке
}


let build = gulp.series(clean, gulp.parallel(css, html)); // серия выполняемых функций. gulp.parallel(css, html) - чтоб эти функции выполнялись паралелльно
let watch = gulp.parallel(build, watchFiles, browserSync); // сценарий самого выполнения 


exports.css = css; // для того чтоб подружить наши переменные с gulp,чтоб он их панимал и работал с ними
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch; // когда мы запускаем gulp, то выполняется переменная watch, которая в свою очередь запускает функцию browsersync, которая в свою очередь будет делать все что нам нужно.



// чтоб остановить процесс выполнения, необходимо нажать ctrl+С
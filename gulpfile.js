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
let rename = require('gulp-rename'); // создает 2 файла (один сжатый css, а другой нет)
let uglify = require('gulp-uglify-es').default; // переменной присваиваем расширение, которое сжимает js код
let imagemin = require('gulp-imagemin'); // переменной присваиваем расширение, которое оптимизирует (сжимает) картинки
let webp = require('gulp-webp'); // переменной присваиваем расширение, которое преобразует картинки в формат webp
let webphtml = require('gulp-webp-html'); // переменной присваиваем расширение, которое автоматически пишет теги для подключенния картинок в формате webp в файле index.html
let webpcss = require('gulp-webpcss'); //переменной присваиваем расширение, которое автоматически пишет теги для подключенния картинок в формате webp в файле css
let ttf2woff = require('gulp-ttf2woff'); //переменной присваиваем расширение, которое автоматически конвертирует шрифт
let ttf2woff2 = require('gulp-ttf2woff2'); //переменной присваиваем расширение, которое автоматически конвертирует шрифт
let fonter = require('gulp-fonter'); //переменной присваиваем расширение, которое автоматически ковертирует шрифт otf



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
        .pipe(webphtml()) //функция, которая автоматически пишет теги для подключенния картинок в формате webp в файле index.html
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
        .pipe(webpcss()) // автоматически добавляем формат webp для наших изображенний в css 
        .pipe(dest(path.build.css)) // т.к. у нас два файла создаються (один сжатый (см. ниже), а другой нет,то мы до того как наш файл будет сжиматься и переименовываться мы его выгрузим (т.е. у нас получается 2 выгрузки)
        .pipe(clean_css())
        .pipe(rename({ // создаем два файла один из которых сжатый
            extname: ".min.css" // в файле index.html подключаем файл style.min.css вместо style.css
        }))
        .pipe(dest(path.build.css)) //переброска файлов из папки с исходниками в папку для заказчика (если папки отсутствуют, то они будут созданны автоматически).  pipe - это функция в которой мы пишем те или иные команды для gulp 
        .pipe(browsersync.stream()) //функция чтоб браузер обновил страницу
}


function js() { // функция для работы с js файлами 
    return src(path.src.js) // возвращает путь к исходным файлам (см. выше let path - src - js)
        .pipe(fileinclude()) // перед тем, как обращаемся к исходникам и подальшей их выгрузкой мы просим наш gulp наши файлы собирать 
        .pipe(dest(path.build.js)) //переброска файлов из папки с исходниками в папку для заказчика (если папки отсутствуют, то они будут созданны автоматически).  pipe - это функция в которой мы пишем те или иные команды для gulp 
        .pipe( // сжимаем js код
            uglify()
        )
        .pipe(rename({ // создаем два файла один из которых сжатый
            extname: ".min.js" // в файле index.html подключаем файл script.min.js вместо script.js
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream()) //функция чтоб браузер обновил страницу
}


function images() { // функция для работы с img файлами 
    return src(path.src.img) // возвращает путь к исходным файлам (см. выше let path - src - img)
        .pipe( // конвертируем в формат webp
            webp({
                quality: 70 // качество изображения
            })
        )
        .pipe(dest(path.build.img)) //переброска файлов из папки с исходниками в папку для заказчика (если папки отсутствуют, то они будут созданны автоматически).  pipe - это функция в которой мы пишем те или иные команды для gulp 
        .pipe(src(path.src.img)) //обращаемся дальше к исходникам, а то работать по другому не будет
        .pipe(
            imagemin({ // оптимизируем картинки. Все настройки нужно смотреть на сайте расщирения
                progressive: true,
                svgoPlugins: [{
                    removeViewBox: false
                }],
                interlaced: true,
                optimizationLevel: 3 // от 0 до 7 (качесвто сжатия)
            })
        )
        .pipe(dest(path.build.img)) //переброска файлов из папки с исходниками в папку для заказчика (если папки отсутствуют, то они будут созданны автоматически).  pipe - это функция в которой мы пишем те или иные команды для gulp 
        .pipe(browsersync.stream()) //функция чтоб браузер обновил страницу
}

function fonts(params) {
    src(path.src.fonts) // получаем исходники шрифтов
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts)) // выгружаем шрифты в папку результат
    return (path.src.fonts) // возвращаем шрифты
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

gulp.task('otf2ttf', function () { // функция преобразовывает шрифт otf в ttf. Эта задача запускается отдельно в новом терминале (паралельно с основным следящим gulp)
    return src([source_folder + "/fonts/*.otf"]) //папка с исхдным шрифтом 
        .pipe(fonter({
            formats: ["ttf"] // получаем формат ttf 
        }))
        .pipe(dest(source_folder + "/fonts/")); // выгружаем в папку с исходниками
})

function watchFiles(params) { // функция, которая работает как расширения live server (отображает изменения на лету)
    gulp.watch([path.watch.html], html); // путь слежения. html после запятой - это функция(см. выше)
    gulp.watch([path.watch.css], css); // путь слежения. css после запятой - это функция(см. выше)
    gulp.watch([path.watch.js], js); // путь слежения. js после запятой - это функция(см. выше)
    gulp.watch([path.watch.img], images); // путь слежения. img после запятой - это название функции(см. выше)
}

function clean(params) { // функция которая чистит папку
    return del(path.clean); // путь к нашей папке
}


let build = gulp.series(clean, gulp.parallel(js, css, html, images)); // серия выполняемых функций. gulp.parallel(js, css, html, images) - чтоб эти функции выполнялись паралелльно
let watch = gulp.parallel(build, watchFiles, browserSync); // сценарий самого выполнения 


exports.images = images; // для того чтоб подружить наши переменные с gulp,чтоб он их понимал и работал с ними
// exports.webp = webp;
exports.js = js;
exports.fonts = fonts;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch; // когда мы запускаем gulp, то выполняется переменная watch, которая в свою очередь запускает функцию browsersync, которая в свою очередь будет делать все что нам нужно.



// чтоб остановить процесс выполнения, необходимо нажать ctrl+С
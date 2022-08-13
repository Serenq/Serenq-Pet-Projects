/*
 * inTheSpotlight: v.1.0.0
 * Novator: Sergey Merkulov (Serenq)
 * Date: 13 aug 2022
 * 
 * Usage:
 * document.querySelectorAll('.elements').inTheSpotlight();
 * 
 * Options:
 * bounds_visible      - bool, show red planks
 * bounds_plank_top    - val, 0 - 100, default = 30
 * bounds_plank_bottom - val, 0 - 100, default = 70
 * element_inSight     - foo, Do something when element is IN
 * element_outSight    - foo, Do something when element is OUT
 * 
 * Example:
 * document.querySelectorAll('.elements').inTheSpotlight({bounds_visible: true, bounds_plank_top: 10, element_inSight: function(){ console.log('Now you are see me!') });
*/

// Нативная плагинизация по идее
;(function(){
    Object.prototype.inTheSpotlight = function(options){
        const DEFAULTS = {
            'bounds_visible'     : false, // Отображение красных корректирующих линий
            'bounds_plank_top'   : 30, // от 0% до 100% границ экрана. Лимит.
            'bounds_plank_bottom': 70, // от 0% до 100% границ экрана. Лимит.
            'element_inSight'    : function(){}, // Сделать что либо когда блок зашёл в область
            'element_outSight'   : function(){}, // Сделать что либо когда блок вышел за пределы
        };

        options = options || DEFAULTS;

        const SETTINGS = Object.assign(DEFAULTS, options);

        let bounds_plank_top = (SETTINGS.bounds_plank_top < 0) // Если верхняя планка меньше 0% то 1% (За экраном нельзя)
                                    ? 1
                                    : (SETTINGS.bounds_plank_top > SETTINGS.bounds_plank_bottom) // Планка не может быть ниже другой планки
                                        ? SETTINGS.bounds_plank_bottom - .1 // Отодвинуть назад от нижней
                                        : SETTINGS.bounds_plank_top;
        let bounds_plank_bottom = (SETTINGS.bounds_plank_bottom > 100) // Если нижняя планка больше 100% то 100% (За экраном нельзя)
                                        ? 99
                                        : (SETTINGS.bounds_plank_bottom < SETTINGS.bounds_plank_top)
                                            ? SETTINGS.bounds_plank_top + .1 // Отодвинуть назад от верхней
                                            : SETTINGS.bounds_plank_bottom;
        let screenHeight = window.innerHeight;
        let chosen_elements = this;

        //Показать границы
        if(SETTINGS.bounds_visible){
            let bound_1 = document.createElement('div');
            let bound_2 = document.createElement('div');

            bound_1.className = 'bound --top';
            bound_2.className = 'bound --bottom';

            document.body.prepend(bound_1, bound_2);

            bound_1.style.top = bounds_plank_top + "%";
            bound_2.style.top = bounds_plank_bottom + "%";
        }//Показать границы

        function updateValues(){
            screenHeight = window.innerHeight;
        }

        function docOnScroll(){
            chosen_elements.forEach(function(element){
                const boundPlank_top_percent = ((screenHeight * bounds_plank_top) / 100);
                const boundPlank_bottom_percent = ((screenHeight * bounds_plank_bottom) / 100);
    
                let element_top = (element.offsetTop - scrollY) - boundPlank_bottom_percent;
                let element_fullHeight = (element.offsetTop + element.offsetHeight - scrollY) - boundPlank_top_percent;
                let checkActive = element.classList.contains('active');
                
                // Елементы за пределами планок
                if( element_fullHeight < 0 || element_top > 0 ){
                    element.classList.add('out');
                    element.classList.remove('active');
                    
                    if(checkActive){SETTINGS.element_outSight()}
                }
                // В зоне видимости
                else {
                    element.classList.remove('out');
                    element.classList.add('active');
    
                    if(!checkActive){SETTINGS.element_inSight()}
                }
            });
        }

        docOnScroll();

        document.addEventListener('scroll', docOnScroll);
        window.addEventListener('resize', updateValues);
    };

    document.querySelectorAll('.story-block p').inTheSpotlight();
}());
// Нативная плагинизация по идее
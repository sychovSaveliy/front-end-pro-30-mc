function request(url, type, body){
    var API = {
        url: 'http://localhost:5000'
    }

    return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();

        xhr.open(type, API.url + url);
        xhr.onreadystatechange = function(){
            if (xhr.readyState != 4) return;
            
              if (xhr.status != 200) {
                reject(xhr.statusText);
              } else {
                resolve(JSON.parse(xhr.responseText));
              }
        }
        xhr.send(body);
    });
}

function initTaskManager(options) {
    var tm = document.querySelector(options.target);
    var buffer = document.querySelector(options.buffer);
    var state = {
        action: null,
        dragSourceType: null,
        element: null,
        resolve: true
    }

    request('/data', 'GET')
        .then(function(response){
            // console.log(response);
            renderBoards(response.boards);
        })
    
    function renderBoards(boards){
        // console.log(boards);
        
        boards.forEach(item => {
            // console.log(item);
            renderBoard({
                title: item.title,
                tasks: item.tasks,
                type: item.type
            });
        });
    }

    function renderBoard(metadata) {
        metadata.title = metadata.title || "";

        var board = document.createElement('div');
        board.classList.add('task-manager__board');
        eventsInit({
            element: board, 
            type: metadata.type, 
            dragable: undefined, 
            buffer: buffer,
            state: state
        });

        var actions = document.createElement('div');
        actions.classList.add('task-manager__actions');
        actions.innerHTML = metadata.title;

        var taslList = document.createElement('div');
        taslList.classList.add('task-manager__task-list');

        board.appendChild(actions);
        board.appendChild(taslList);
        tm.appendChild(board);

        metadata.tasks.forEach(function(item){
            // console.log(item);
            if (item.rendered) {
                return;
            }
            renderTask({
                target: taslList,
                title: item.title,
                type: item.type,
                dragable: item.dragable
            });
        });
    }

    function renderTask(metadata) {
        metadata.title = metadata.title || "";
        if (metadata.dragable === undefined) {
            metadata.dragable = true;
        }

        var taskItem = document.createElement('div');
        taskItem.classList.add('task-manager__task-item');
        eventsInit({
            element: taskItem, 
            type: metadata.type, 
            dragable: metadata.dragable, 
            buffer: buffer,
            state: state
        });

        var taskTitle = document.createElement('div');
        taskTitle.classList.add('task-manager__task-title');
        taskTitle.innerHTML = metadata.title
        
        taskItem.appendChild(taskTitle);
        metadata.target.appendChild(taskItem);
    }
}

function eventsInit(options) {
    // console.log(element, type, dragable);
    if (!options.dragable && options.type === 'task') {
        return;
    }
    var handlers = {};

    handlers.task = function(){
       options.element.addEventListener('mousedown', function(event){
            // console.log(event);
            var startX = event.pageX,
                startY = event.pageY,
                insetX = -5,
                insetY = +5,
                self = this,
                dragElement = this.cloneNode(true);
                options.state.element = self;
                options.state.resolve = true;

            options.state.action = 'DRAG';
            options.state.dragSourceType = options.type;
            
            self.classList.add('hidden');
            options.buffer.appendChild(dragElement);
            
            dragElement.classList.add('drag');
            dragElement.style.left = startX - insetX + "px";
            dragElement.style.top = startY - insetY + "px";

            window.moveIt = move.bind(null, {
                dragElement: dragElement,
                startX: startX,
                startY: startY,
                insetX: insetX,
                insetY: insetY
            });

            window.upResetIt = upReset.bind(null, {
                dragElement: dragElement,
                startX: startX,
                startY: startY,
                insetX: insetX,
                insetY: insetY
            });

            document.addEventListener('mousemove', moveIt);
            document.addEventListener('mouseup', upResetIt);  
        });
    }

    handlers.board = function() {
        options.element.addEventListener('mouseenter', function(){
            if (!options.state.action || !options.state.resolve) {
                return;
            }

            // console.log('enter', options.state.resolve);

            document.addEventListener('mouseup', function(){
                // console.log(options);
                
                options.element
                    .querySelector('.task-manager__task-list')
                    .appendChild(options.state.element);

                options.state.action = null;
                options.state.resolve = true;
            });
        });
    }

    function move(data, event){
        var diffX = -(data.startX - event.pageX),
            diffY = -(data.startY - event.pageY);
            data.dragElement.style.left = data.startX - data.insetX + diffX  + "px";
            data.dragElement.style.top = data.startY - data.insetY + diffY + "px";
    }

    function upReset(data, event){
        options.state.action = null;
        document.removeEventListener('mousemove', moveIt);
        setTimeout(function(){
            data.dragElement.style.transition = ".5s";
            data.dragElement.style.left = options.state.element.offsetLeft + "px";
            data.dragElement.style.top = options.state.element.offsetTop + "px";
        }, 0);

        setTimeout(function(){
            data.dragElement.remove();
            options.element.classList.remove('hidden');

            document.removeEventListener('mouseup', upResetIt);
        }, 500);
    }

    handlers[options.type]();
}


window.onload = function() {

    initTaskManager({
        target: "#task-manager",
        buffer: "#task-manager-buffer"
    });

}
$(document).ready(function() {
  var apiRoot = 'https://3a098740-c4fb-4c8f-bc54-ac597329dea8-00-2fge5iq601k11.picard.replit.dev/v1/tasks';
  var datatableRowTemplate = $('[data-datatable-row-template]').children()[0];
  var tasksContainer = $('[data-tasks-container]');

  // init
  getAllTasks();

  function createElement(data) {
    var element = $(datatableRowTemplate).clone();

    element.attr('data-task-id', data.id);
    element.find('[data-task-name-section] [data-task-name-paragraph]').text(data.title);
    element.find('[data-task-name-section] [data-task-name-input]').val(data.title);

    element.find('[data-task-content-section] [data-task-content-paragraph]').text(data.content);
    element.find('[data-task-content-section] [data-task-content-input]').val(data.content);

    return element;
  }

  function handleDatatableRender(data) {
    tasksContainer.empty();
    data.forEach(function(task) {
      createElement(task).appendTo(tasksContainer);
    });
  }

  function getAllTasks() {
    var requestUrl = apiRoot;

    $.ajax({
      url: requestUrl,
      method: 'GET',
      success: handleDatatableRender,
      error: function() {
        alert('Failed to fetch tasks');
      }
    });
  }

  function handleTaskUpdateRequest() {
    var parentEl = $(this).parents('[data-task-id]');
    var taskId = parentEl.attr('data-task-id');
    var taskTitle = parentEl.find('[data-task-name-input]').val();
    var taskContent = parentEl.find('[data-task-content-input]').val();
    var requestUrl = apiRoot;

    $.ajax({
      url: requestUrl,
      method: 'PUT',
      processData: false,
      contentType: 'application/json',
      data: JSON.stringify({
        id: taskId,
        title: taskTitle,
        content: taskContent
      }),
      success: function(data) {
        parentEl.attr('data-task-id', data.id).toggleClass('datatable__row--editing');
        parentEl.find('[data-task-name-paragraph]').text(data.title);
        parentEl.find('[data-task-content-paragraph]').text(data.content);
      },
      error: function() {
        alert('Failed to update task');
      }
    });
  }

  function handleTaskDeleteRequest() {
    var parentEl = $(this).parents('[data-task-id]');
    var taskId = parentEl.attr('data-task-id');
    var requestUrl = apiRoot + '?taskId=' + taskId;

    $.ajax({
      url: requestUrl,
      method: 'DELETE',
      success: function() {
        parentEl.slideUp(400, function() { parentEl.remove(); });
      },
      error: function() {
        alert('Failed to delete task');
      }
    });
  }

  function handleTaskSubmitRequest(event) {
    event.preventDefault();

    var taskTitle = $(this).find('[name="title"]').val();
    var taskContent = $(this).find('[name="content"]').val();

    var requestUrl = apiRoot;

    $.ajax({
      url: requestUrl,
      method: 'POST',
      processData: false,
      contentType: 'application/json',
      data: JSON.stringify({
        title: taskTitle,
        content: taskContent
      }),
      success: function(data) {
        createElement(data).appendTo(tasksContainer);
      },
      error: function() {
        alert('Failed to create task');
      }
    });
  }

  function toggleEditingState() {
    var parentEl = $(this).parents('[data-task-id]');
    parentEl.toggleClass('datatable__row--editing');

    var taskTitle = parentEl.find('[data-task-name-paragraph]').text();
    var taskContent = parentEl.find('[data-task-content-paragraph]').text();

    parentEl.find('[data-task-name-input]').val(taskTitle);
    parentEl.find('[data-task-content-input]').val(taskContent);
  }

  $('[data-task-add-form]').on('submit', handleTaskSubmitRequest);

  tasksContainer.on('click','[data-task-edit-button]', toggleEditingState);
  tasksContainer.on('click','[data-task-edit-abort-button]', toggleEditingState);
  tasksContainer.on('click','[data-task-submit-update-button]', handleTaskUpdateRequest);
  tasksContainer.on('click','[data-task-delete-button]', handleTaskDeleteRequest);
});

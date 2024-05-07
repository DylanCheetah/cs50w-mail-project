document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Add listener for email composition form
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(evt) {
  // Send email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then((response) => response.json())
  .then((result) => {
    //Did an error occur?
    if (result.error) {
      alert(result.error);
      return;
    }

    // Switch to the "sent" mailbox
    load_mailbox('sent');
  }).catch((error) => {
    alert(error);
  });

  // Prevent default form action
  evt.preventDefault();
  return false; // BUG: Returning false doesn't prevent the form from getting submitted on Microsoft Edge
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch the email messages in the given mailbox
  fetch(`/emails/${mailbox}`)
  .then((response) => response.json())
  .then((result) => {
    // Did an error occur?
    if (result.error) {
      alert(result.error);
      return;
    }

    // Display the emails in the mailbox
    const emailsView = document.querySelector('#emails-view');

    const emailList = document.createElement('div');
    emailList.classList.add('container-fluid');
    let html = '<div class="row bg-primary text-light">';
    html    += '    <div class="col-3 border"><strong>Sender</strong></div>';
    html    += '    <div class="col-5 border"><strong>Subject</strong></div>';
    html    += '    <div class="col-2 border"><strong>Timestamp</strong></div>';
    html    += '    <div class="col-2 border"><strong>Archive</strong></div>';
    html    += '</div>';
    emailList.innerHTML = html;
    emailsView.append(emailList)

    result.forEach((email) => {
      const a = document.createElement('a');
      a.classList.add('row');
      a.style.textDecoration = 'none';
      a.href = '#';
      a.dataset.id = email.id;

      let btnMsg = 'Archive';

      if (mailbox === 'archive') {
        btnMsg = 'Unarchive';
      }

      let html = `<div class="col-3 border" style="overflow: hidden;">${email.sender}</div>`;
      html    += `<div class="col-5 border">${email.subject}</div>`;
      html    += `<div class="col-2 border">${email.timestamp}</div>`;
      html    += `<div class="col-2 border"><button class="btn btn-info" onclick="toggle_archive(event, '${email.id}');">${btnMsg}</button></div>`;
      a.innerHTML = html;
      a.addEventListener('click', (evt) => {
        view_email(a.dataset.id);
        evt.preventDefault();
        return false; // BUG: This fails to prevent the default action in Microsoft Edge
      });

      if (email.read) {
        a.style.backgroundColor = 'gray';
        a.style.color = 'white';
      } else {
        a.style.backgroundColor = 'white';
        a.style.color = 'black';
      }

      emailList.append(a);
    });
  })
  .catch((error) => {
    alert(error);
  });
}

function view_email(id) {
  // Show the email view and hide all other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Fetch the email with the given ID
  fetch(`/emails/${id}`)
  .then((response) => response.json())
  .then((result) => {
    let html = '<div class="container-fluid">';
    html    += '    <div class="row">';
    html    += '        <div class="col-2"><strong>Sender:</strong></div>';
    html    += `        <div class="col-10">${result.sender}</div>`;
    html    += '    </div>';
    html    += '    <div class="row">';
    html    += '        <div class="col"><hr></div>';
    html    += '    </div>';
    html    += '    <div class="row">';
    html    += '        <div class="col-2"><strong>Recipients:</strong></div>';
    html    += `        <div class="col-10">${result.recipients}</div>'`;
    html    += '    </div>';
    html    += '    <div class="row">';
    html    += '        <div class="col"><hr></div>';
    html    += '    </div>';
    html    += '    <div class="row">';
    html    += '        <div class="col-2"><strong>Subject:</strong></div>';
    html    += `        <div class="col-10">${result.subject}</div>`;
    html    += '    </div>';
    html    += '    <div class="row">';
    html    += '        <div class="col"><hr></div>';
    html    += '    </div>';
    html    += '    <div class="row">';
    html    += '        <div class="col-2"><strong>Timestamp:</strong></div>';
    html    += `        <div class="col-10">${result.timestamp}</div>`;
    html    += '    </div>';
    html    += '    <div class="row">';
    html    += '        <div class="col"><hr></div>';
    html    += '    </div>';
    html    += '    <pre class="row">';
    html    += `        <div class="col">${result.body}</div>`;
    html    += '    </pre>';
    html    += '    <div class="row">';
    html    += '        <div class="col"><hr></div>';
    html    += '    </div>';
    html    += '    <div class="row">';
    html    += `        <div class="col-2"><button class="btn btn-danger" onclick="reply('${id}');">Reply</button></div>`;
    html    += '    </div>';
    html    += '</div>';
    document.querySelector('#email-view').innerHTML = html;
  })
  .catch((error) => {
    alert(error);
  });

  // Mark the email message as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  .catch((error) => {
    alert(error);
  });
}

function toggle_archive(evt, id) {
  // Toggle archive status
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: evt.srcElement.innerHTML === 'Archive'
    })
  })
  .then(() => {
    // Load the inbox
    load_mailbox('inbox');
  })
  .catch((error) => {
    alert(error);
  });

  // Prevent event propagation
  evt.stopPropagation();
}

function reply(id) {
  // Fetch the email with the given ID
  fetch(`/emails/${id}`)
  .then((response) => response.json())
  .then((result) => {
    // Show compose form
    compose_email();

    // Set input fields on the compose form
    document.querySelector('#compose-recipients').value = result.sender;
    document.querySelector('#compose-subject').value = `RE: ${result.subject}`;
    document.querySelector('#compose-body').value = `On ${result.timestamp} ${result.sender} wrote:\n${result.body}\n\n`;
  })
  .catch((error) => {
    alert(error);
  });
}
document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));

  document.querySelector("#compose").addEventListener("click", compose_email);

  document.querySelector("#compose-form").addEventListener("submit", () => {
    const recipients = document.getElementById("compose-recipients").value;
    const subject = document.getElementById("compose-subject").value;
    const body = document.getElementById("compose-body").value;

    const form = { recipients: recipients, subject: subject, body: body };
    send_mail(form);
  });
  // By default, load the inbox
  load_mailbox("inbox");
});

function send_mail(form) {
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: form.recipients,
      subject: form.subject,
      body: form.body,
      read: false,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);
    });
  load_mailbox("sent");
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#email-view").style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function reply_email(email) {
    // Show compose view and hide other views
    document.querySelector("#emails-view").style.display = "none";
    document.querySelector("#compose-view").style.display = "block";
    document.querySelector("#email-view").style.display = "none";
  
    // Clear out composition fields
  document.querySelector("#compose-recipients").value = email.sender;
  console.log(email.subject.search("Re: "))
  let subject;
  if (email.subject.search("Re: ")!==-1){
    subject = email.subject;
  } else {
    subject = `Re: ${email.subject}`;
  }
    document.querySelector("#compose-subject").value = subject;
    document.querySelector("#compose-body").value = `\n-----------------------------------------------\n on ${email.timestamp} ${email.sender} wrote:\n\n${email.body}`;
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#email-view").style.display = "none";

  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3><hr>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => {
        var element = document.createElement("div");
        element.innerHTML = `<div class="container"><div class="row"><div class="col-8"><a id="email${email.id}" href="javascript:void(0);"><p><b>${email.sender}</b> ${email.subject}</p> </a></div><div class="col-4">${email.timestamp}</div></div> </div><hr>`;
        element.addEventListener("click", () => show_email(email));
        document.getElementById("emails-view").appendChild(element);
        if (!email.read) {
          element.style.backgroundColor = "White";
        } else {
          element.style.backgroundColor = "Grey";
        }
      });
    });
}

function show_email(email) {
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "block";
  document.querySelector("#email-view").innerHTML = "";
  const element = document.createElement("div");
  element.innerHTML = `<label for="check">Archive</label><input ${
    email.archived ? "checked" : ""
  } type="checkbox" id="check"><h4><b>From:</b> ${
    email.sender
  }</h4><h4><b>To:</b> ${email.recipients}</h4><h4><b>Subject:</b> ${
    email.subject
  }</h4><h5><b>Time:</b> ${email.timestamp}</h5><hr><p>${email.body.replaceAll("\n","<br>")}</p><a id="reply" class="btn btn-primary">Reply</a>`;
  document.querySelector("#email-view").appendChild(element);
  document.getElementById("reply").addEventListener("click", () => reply_email(email))
  document.getElementById("check").addEventListener("click", () => {
    fetch(`/emails/${email.id}`, {
      method: "PUT",
      body: JSON.stringify({
        archived: document.getElementById("check").checked,
      }),
    });
    setTimeout(function () {
      load_mailbox("inbox");
    }, 100);
  });

  fetch(`/emails/${email.id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

import nodemailer from "nodemailer";

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.RESEND_KEY,
    port: 25,
    secure: false, // true for 465, false for other ports
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"H&A Improvoments" <f6dx@lge.com>', // sender address
    to: email, // list of receivers
    subject: "Two Factor Authentication", // Subject line
    html: `
      <html>
        <head>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: Arial, sans-serif;
              background-color: #111111;
              margin: 0;
              padding: 0;
            }
            .container {
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .content {
              text-align: center;
              padding: 50px;
              
            }
            h1 {
              color: #333333;
            }
            .code {
              font-size: 24px;
              font-weight: bold;
              color: #007bff;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1>Two Factor Authentication</h1>
              <p>Your two factor authentication code is:</p>
              <p class="code">${token}</p>
              <p>Please use this code to complete your login process.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  console.log("Message sent: %s", info.messageId);
};

const domain = process.env.NEXT_PUBLIC_APP_URL;
const login = `${domain}/auth/login`;
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.RESEND_KEY,
    port: 25,
    secure: false, // true for 465, false for other ports
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"H&A Improvoments" <f6dx@lge.com>', // sender address
    to: email, // list of receivers
    subject: "Reset your password", // Subject line
    html: `<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  lang="en"
>
  <head>
    <title></title>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <!--[if !mso]>-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta name="x-apple-disable-message-reformatting" content="" />
    <meta content="target-densitydpi=device-dpi" name="viewport" />
    <meta content="true" name="HandheldFriendly" />
    <meta content="width=device-width" name="viewport" />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <style type="text/css">
      table {
        border-collapse: separate;
        table-layout: fixed;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      table td {
        border-collapse: collapse;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      body,
      a,
      li,
      p,
      h1,
      h2,
      h3 {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      html {
        -webkit-text-size-adjust: none !important;
      }
      body,
      #innerTable {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      #innerTable img + div {
        display: none;
        display: none !important;
      }
      img {
        margin: 0;
        padding: 0;
        -ms-interpolation-mode: bicubic;
      }
      h1,
      h2,
      h3,
      p,
      a {
        line-height: 1;
        overflow-wrap: normal;
        white-space: normal;
        word-break: break-word;
      }
      a {
        text-decoration: none;
      }
      h1,
      h2,
      h3,
      p {
        min-width: 100% !important;
        width: 100% !important;
        max-width: 100% !important;
        display: inline-block !important;
        border: 0;
        padding: 0;
        margin: 0;
      }
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      u + #body a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
      a[href^="mailto"],
      a[href^="tel"],
      a[href^="sms"] {
        color: inherit;
        text-decoration: none;
      }
      img,
      p {
        margin: 0;
        margin: 0;
        font-family: Fira Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
          Arial, sans-serif;
        line-height: 21px;
        font-weight: 400;
        font-style: normal;
        font-size: 14px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #555;
        text-align: center;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      h1 {
        margin: 0;
        margin: 0;
        font-family: Roboto, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 34px;
        font-weight: 400;
        font-style: normal;
        font-size: 28px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      h2 {
        margin: 0;
        margin: 0;
        font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 30px;
        font-weight: 400;
        font-style: normal;
        font-size: 24px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      h3 {
        margin: 0;
        margin: 0;
        font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 26px;
        font-weight: 400;
        font-style: normal;
        font-size: 20px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
    </style>
    <style type="text/css">
      @media (min-width: 481px) {
        .hd {
          display: none !important;
        }
      }
    </style>
    <style type="text/css">
      @media (max-width: 480px) {
        .hm {
          display: none !important;
        }
      }
    </style>
    <style type="text/css">
      @media (min-width: 481px) {
        h1,
        img,
        p {
          margin: 0;
          margin: 0;
        }
        img,
        p {
          font-family: Fira Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
            Arial, sans-serif;
          line-height: 21px;
          font-weight: 400;
          font-style: normal;
          font-size: 14px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #555;
          text-align: center;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h1 {
          font-family: Roboto, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
            Arial, sans-serif;
          line-height: 34px;
          font-weight: 400;
          font-style: normal;
          font-size: 28px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h2,
        h3 {
          margin: 0;
          margin: 0;
          font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
            sans-serif;
          font-weight: 400;
          font-style: normal;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h2 {
          line-height: 30px;
          font-size: 24px;
        }
        h3 {
          line-height: 26px;
          font-size: 20px;
        }
        .t8 {
          width: 720px !important;
        }
        .t26 {
          padding: 40px 60px 50px !important;
          width: 680px !important;
        }
        .t11,
        .t15,
        .t24,
        .t32,
        .t36 {
          width: 600px !important;
        }
        .t19 {
          width: 580px !important;
        }
        .t38 {
          padding-left: 0 !important;
          padding-right: 0 !important;
          width: 400px !important;
        }
      }
    </style>
    <style type="text/css" media="screen and (min-width:481px)">
      .moz-text-html img,
      .moz-text-html p {
        margin: 0;
        margin: 0;
        font-family: Fira Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
          Arial, sans-serif;
        line-height: 21px;
        font-weight: 400;
        font-style: normal;
        font-size: 14px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #555;
        text-align: center;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      .moz-text-html h1 {
        margin: 0;
        margin: 0;
        font-family: Roboto, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 34px;
        font-weight: 400;
        font-style: normal;
        font-size: 28px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      .moz-text-html h2 {
        margin: 0;
        margin: 0;
        font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 30px;
        font-weight: 400;
        font-style: normal;
        font-size: 24px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      .moz-text-html h3 {
        margin: 0;
        margin: 0;
        font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 26px;
        font-weight: 400;
        font-style: normal;
        font-size: 20px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      .moz-text-html .t8 {
        width: 720px !important;
      }
      .moz-text-html .t26 {
        padding: 40px 60px 50px !important;
        width: 680px !important;
      }
      .moz-text-html .t11,
      .moz-text-html .t15 {
        width: 600px !important;
      }
      .moz-text-html .t19 {
        width: 580px !important;
      }
      .moz-text-html .t24 {
        width: 600px !important;
      }
      .moz-text-html .t38 {
        padding-left: 0 !important;
        padding-right: 0 !important;
        width: 400px !important;
      }
      .moz-text-html .t32,
      .moz-text-html .t36 {
        width: 600px !important;
      }
    </style>
    <!--[if !mso]>-->
    <link
      // href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;700&amp;family=Albert+Sans:wght@800&amp;display=swap"
      rel="stylesheet"
      type="text/css"
    />
    <!--<![endif]-->
    <!--[if mso]>
      <style type="text/css">
        img,
        p {
          margin: 0;
          margin: 0;
          font-family: Fira Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
            Arial, sans-serif;
          line-height: 21px;
          font-weight: 400;
          font-style: normal;
          font-size: 14px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #555;
          text-align: center;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h1 {
          margin: 0;
          margin: 0;
          font-family: Roboto, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
            Arial, sans-serif;
          line-height: 34px;
          font-weight: 400;
          font-style: normal;
          font-size: 28px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h2 {
          margin: 0;
          margin: 0;
          font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
            sans-serif;
          line-height: 30px;
          font-weight: 400;
          font-style: normal;
          font-size: 24px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h3 {
          margin: 0;
          margin: 0;
          font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
            sans-serif;
          line-height: 26px;
          font-weight: 400;
          font-style: normal;
          font-size: 20px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        td.t8 {
          width: 800px !important;
        }
        td.t26 {
          padding: 40px 60px 50px !important;
          width: 800px !important;
        }
        td.t11,
        td.t15,
        td.t19,
        td.t24 {
          width: 600px !important;
        }
        td.t38 {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        td.t32,
        td.t36 {
          width: 600px !important;
        }
      </style>
    <![endif]-->
    <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
  </head>
  <body
    id="body"
    class="t43"
    style="
      min-width: 100%;
      margin: 0px;
      padding: 0px;
      background-color: #000000;
    "
  >
    <div class="t42" style="background-color: #000000">
      <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        align="center"
      >
        <tr>
          <td
            class="t41"
            style="
              font-size: 0;
              line-height: 0;
              mso-line-height-rule: exactly;
              background-color: #000000;
            "
            valign="top"
            align="center"
          >
            <!--[if mso]>
              <v:background
                xmlns:v="urn:schemas-microsoft-com:vml"
                fill="true"
                stroke="false"
              >
                <v:fill color="#000000" />
              </v:background>
            <![endif]-->
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              align="center"
              id="innerTable"
            >
              <tr>
                <td>
                  <table
                    class="t4"
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    align="center"
                  >
                    <tr>
                      <!--[if !mso]>-->
                      <td
                        class="t3"
                        style="width: 320px; padding: 40px 40px 40px 40px"
                      >
                        <!--<![endif]-->
                        <!--[if mso]><td class=t3 style="width:400px;padding:40px 40px 40px 40px;"><![endif]-->
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tr>
                            <td>
                              <table
                                class="t2"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td class="t1" style="width: 55px">
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t1 style="width:55px;"><![endif]-->
                                    <div style="font-size: 0px">
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table
                    class="t29"
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    align="center"
                  >
                    <tr>
                      <!--[if !mso]>-->
                      <td
                        class="t28"
                        style="background-color: #ffffff; width: 400px"
                      >
                        <!--<![endif]-->
                        <!--[if mso]><td class=t28 style="background-color:#FFFFFF;width:400px;"><![endif]-->
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tr>
                            <td>
                              <table
                                class="t9"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td
                                    class="t8"
                                    style="
                                      background-color: #ebebeb;
                                      width: 400px;
                                      padding: 40px 40px 40px 40px;
                                    "
                                  >
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t8 style="background-color:#a50034;width:480px;padding:40px 40px 40px 40px;"><![endif]-->
                                    <table
                                      role="presentation"
                                      width="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                    >
                                      <tr>
                                        <td>
                                          <table
                                            class="t7"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t6"
                                                style="width: 200px"
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t6 style="width:200px;"><![endif]-->
                                                <div style="font-size: 0px">
                                                  <img
                                                    class="t5"
                                                    style="
                                                      display: block;
                                                      border: 0;
                                                      height: auto;
                                                      width: 100%;
                                                      margin: 0;
                                                      max-width: 100%;
                                                    "
                                                    width="200"
                                                    height="200"
                                                    alt=""
                                                    src="https://media.us.lg.com/transform/6c7ea0f8-5f94-4fc3-a8fe-18ad05ac2205/lg_logo"
                                                  />
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <table
                                class="t27"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td
                                    class="t26"
                                    style="
                                      width: 420px;
                                      padding: 30px 30px 40px 30px;
                                    "
                                  >
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t26 style="width:480px;padding:30px 30px 40px 30px;"><![endif]-->
                                    <table
                                      role="presentation"
                                      width="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                    >
                                      <tr>
                                        <td>
                                          <table
                                            class="t12"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t11"
                                                style="width: 480px"
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t11 style="width:480px;"><![endif]-->
                                                <h1
                                                  class="t10"
                                                  style="
                                                    margin: 0;
                                                    margin: 0;
                                                    font-family: Albert Sans,
                                                      BlinkMacSystemFont,
                                                      Segoe UI, Helvetica Neue,
                                                      Arial, sans-serif;
                                                    line-height: 35px;
                                                    font-weight: 800;
                                                    font-style: normal;
                                                    font-size: 30px;
                                                    text-decoration: none;
                                                    text-transform: none;
                                                    letter-spacing: -1.2px;
                                                    direction: ltr;
                                                    color: #333333;
                                                    text-align: center;
                                                    mso-line-height-rule: exactly;
                                                    mso-text-raise: 2px;
                                                  "
                                                >
                                                  Reset your password
                                                </h1>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <div
                                            class="t13"
                                            style="
                                              mso-line-height-rule: exactly;
                                              mso-line-height-alt: 16px;
                                              line-height: 16px;
                                              font-size: 1px;
                                              display: block;
                                            "
                                          >
                                            &nbsp;
                                          </div>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <table
                                            class="t16"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="left"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t15"
                                                style="width: 480px"
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t15 style="width:480px;"><![endif]-->
                                                <p
                                                  class="t14"
                                                  style="
                                                    margin: 0;
                                                    margin: 0;
                                                    font-family: Inter Tight,
                                                      BlinkMacSystemFont,
                                                      Segoe UI, Helvetica Neue,
                                                      Arial, sans-serif;
                                                    line-height: 21px;
                                                    font-weight: 400;
                                                    font-style: normal;
                                                    font-size: 14px;
                                                    text-decoration: none;
                                                    text-transform: none;
                                                    direction: ltr;
                                                    color: #555555;
                                                    text-align: center;
                                                    mso-line-height-rule: exactly;
                                                    mso-text-raise: 2px;
                                                  "
                                                >
                                                  Click the button below to
                                                  reset your password and log in to your account
                                                </p>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <div
                                            class="t17"
                                            style="
                                              mso-line-height-rule: exactly;
                                              mso-line-height-alt: 30px;
                                              line-height: 30px;
                                              font-size: 1px;
                                              display: block;
                                            "
                                          >
                                            &nbsp;
                                          </div>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <table
                                            class="t20"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t19"
                                                style="
                                                  background-color: #a50034;
                                                  overflow: hidden;
                                                  width: 460px;
                                                  text-align: center;
                                                  line-height: 24px;
                                                  mso-line-height-rule: exactly;
                                                  mso-text-raise: 2px;
                                                  padding: 10px 10px 10px 10px;
                                                  border-radius: 10px 10px 10px
                                                    10px;
                                                "
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t19 style="background-color:#a50034;overflow:hidden;width:480px;text-align:center;line-height:24px;mso-line-height-rule:exactly;mso-text-raise:2px;padding:10px 10px 10px 10px;border-radius:10px 10px 10px 10px;"><![endif]-->
                                                <div
                                                  class="t18"
                                                  style="
                                                    display: block;
                                                    margin: 0;
                                                    margin: 0;
                                                    font-family: Inter Tight,
                                                      BlinkMacSystemFont,
                                                      Segoe UI, Helvetica Neue,
                                                      Arial, sans-serif;
                                                    line-height: 24px;
                                                    font-weight: 600;
                                                    font-style: normal;
                                                    font-size: 16px;
                                                    text-decoration: none;
                                                    direction: ltr;
                                                    color: #ffffff;
                                                    text-align: center;
                                                    mso-line-height-rule: exactly;
                                                    mso-text-raise: 2px;
                                                  "
                                                  <a
                                                    class="t21"
                                                    href="https://tabular.email"
                                                    style="
                                                      margin: 0;
                                                      margin: 0;
                                                      font-weight: 700;
                                                      font-style: normal;
                                                      text-decoration: none;
                                                      direction: ltr;
                                                      color: #000000;
                                                      mso-line-height-rule: exactly;
                                                    "
                                                    target=""
                                                    ><a
                                                    class="t21"
                                                    href="${resetLink}"
                                                    style="
                                                      margin: 0;
                                                      margin: 0;
                                                      font-weight: 700;
                                                      font-style: normal;
                                                      text-decoration: none;
                                                      direction: ltr;
                                                      color: #ffffff;
                                                      mso-line-height-rule: exactly;
                                                    "
                                                    target="_blank"
                                                    >Reset</a
                                                  ></a
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <div
                                            class="t23"
                                            style="
                                              mso-line-height-rule: exactly;
                                              mso-line-height-alt: 12px;
                                              line-height: 12px;
                                              font-size: 1px;
                                              display: block;
                                            "
                                          >
                                            &nbsp;
                                          </div>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <table
                                            class="t25"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t24"
                                                style="width: 480px"
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t24 style="width:480px;"><![endif]-->
                                                <p
                                                  class="t22"
                                                  style="
                                                    margin: 0;
                                                    margin: 0;
                                                    font-family: Inter Tight,
                                                      BlinkMacSystemFont,
                                                      Segoe UI, Helvetica Neue,
                                                      Arial, sans-serif;
                                                    line-height: 21px;
                                                    font-weight: 400;
                                                    font-style: normal;
                                                    font-size: 14px;
                                                    text-decoration: none;
                                                    text-transform: none;
                                                    direction: ltr;
                                                    color: #555555;
                                                    text-align: center;
                                                    mso-line-height-rule: exactly;
                                                    mso-text-raise: 2px;
                                                  "
                                                >
                                                  or
                                                  <a
                                                    class="t21"
                                                    href="${login}"
                                                    style="
                                                      margin: 0;
                                                      margin: 0;
                                                      font-weight: 700;
                                                      font-style: normal;
                                                      text-decoration: none;
                                                      direction: ltr;
                                                      color: #000000;
                                                      mso-line-height-rule: exactly;
                                                    "
                                                    target="_blank"
                                                    >log in</a
                                                  >
                                                  to your account
                                                </p>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <div
                    class="t30"
                    style="
                      mso-line-height-rule: exactly;
                      mso-line-height-alt: 30px;
                      line-height: 30px;
                      font-size: 1px;
                      display: block;
                    "
                  >
                    &nbsp;
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <table
                    class="t39"
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    align="center"
                  >
                    <tr>
                      <!--[if !mso]>-->
                      <td
                        class="t38"
                        style="width: 320px; padding: 0 40px 0 40px"
                      >
                        <!--<![endif]-->
                        <!--[if mso]><td class=t38 style="width:400px;padding:0 40px 0 40px;"><![endif]-->
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tr>
                            <td>
                              <table
                                class="t33"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td class="t32" style="width: 480px">
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t32 style="width:480px;"><![endif]-->
                                    <p
                                      class="t31"
                                      style="
                                        margin: 0;
                                        margin: 0;
                                        font-family: Inter Tight,
                                          BlinkMacSystemFont, Segoe UI,
                                          Helvetica Neue, Arial, sans-serif;
                                        line-height: 18px;
                                        font-weight: 400;
                                        font-style: normal;
                                        font-size: 12px;
                                        text-decoration: none;
                                        text-transform: none;
                                        direction: ltr;
                                        color: #555555;
                                        text-align: center;
                                        mso-line-height-rule: exactly;
                                        mso-text-raise: 2px;
                                      "
                                    ></p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div
                                class="t35"
                                style="
                                  mso-line-height-rule: exactly;
                                  mso-line-height-alt: 8px;
                                  line-height: 8px;
                                  font-size: 1px;
                                  display: block;
                                "
                              >
                                &nbsp;
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <table
                                class="t37"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td class="t36" style="width: 480px">
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t36 style="width:480px;"><![endif]-->
                                    <p
                                      class="t34"
                                      style="
                                        margin: 0;
                                        margin: 0;
                                        font-family: Inter Tight,
                                          BlinkMacSystemFont, Segoe UI,
                                          Helvetica Neue, Arial, sans-serif;
                                        line-height: 18px;
                                        font-weight: 400;
                                        font-style: normal;
                                        font-size: 12px;
                                        text-decoration: none;
                                        text-transform: none;
                                        direction: ltr;
                                        color: #555555;
                                        text-align: center;
                                        mso-line-height-rule: exactly;
                                        mso-text-raise: 2px;
                                      "
                                    ></p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <div
                    class="t40"
                    style="
                      mso-line-height-rule: exactly;
                      mso-line-height-alt: 100px;
                      line-height: 100px;
                      font-size: 1px;
                      display: block;
                    "
                  >
                    &nbsp;
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>"`, // html body
  });

  console.log("Message sent: %s", info.messageId);
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.RESEND_KEY,
    port: 25,
    secure: false, // true for 465, false for other ports
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"H&A Improvoments" <f6dx@lge.com>', // sender address
    to: email, // list of receivers
    subject: "Verify your email", // Subject line
    html: `
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  lang="en"
>
  <head>
    <title></title>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <!--[if !mso]>-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta name="x-apple-disable-message-reformatting" content="" />
    <meta content="target-densitydpi=device-dpi" name="viewport" />
    <meta content="true" name="HandheldFriendly" />
    <meta content="width=device-width" name="viewport" />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <style type="text/css">
      table {
        border-collapse: separate;
        table-layout: fixed;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      table td {
        border-collapse: collapse;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      body,
      a,
      li,
      p,
      h1,
      h2,
      h3 {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      html {
        -webkit-text-size-adjust: none !important;
      }
      body,
      #innerTable {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      #innerTable img + div {
        display: none;
        display: none !important;
      }
      img {
        margin: 0;
        padding: 0;
        -ms-interpolation-mode: bicubic;
      }
      h1,
      h2,
      h3,
      p,
      a {
        line-height: 1;
        overflow-wrap: normal;
        white-space: normal;
        word-break: break-word;
      }
      a {
        text-decoration: none;
      }
      h1,
      h2,
      h3,
      p {
        min-width: 100% !important;
        width: 100% !important;
        max-width: 100% !important;
        display: inline-block !important;
        border: 0;
        padding: 0;
        margin: 0;
      }
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      u + #body a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
      a[href^="mailto"],
      a[href^="tel"],
      a[href^="sms"] {
        color: inherit;
        text-decoration: none;
      }
      img,
      p {
        margin: 0;
        margin: 0;
        font-family: Fira Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
          Arial, sans-serif;
        line-height: 21px;
        font-weight: 400;
        font-style: normal;
        font-size: 14px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #555;
        text-align: center;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      h1 {
        margin: 0;
        margin: 0;
        font-family: Roboto, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 34px;
        font-weight: 400;
        font-style: normal;
        font-size: 28px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      h2 {
        margin: 0;
        margin: 0;
        font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 30px;
        font-weight: 400;
        font-style: normal;
        font-size: 24px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      h3 {
        margin: 0;
        margin: 0;
        font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 26px;
        font-weight: 400;
        font-style: normal;
        font-size: 20px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
    </style>
    <style type="text/css">
      @media (min-width: 481px) {
        .hd {
          display: none !important;
        }
      }
    </style>
    <style type="text/css">
      @media (max-width: 480px) {
        .hm {
          display: none !important;
        }
      }
    </style>
    <style type="text/css">
      @media (min-width: 481px) {
        h1,
        img,
        p {
          margin: 0;
          margin: 0;
        }
        img,
        p {
          font-family: Fira Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
            Arial, sans-serif;
          line-height: 21px;
          font-weight: 400;
          font-style: normal;
          font-size: 14px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #555;
          text-align: center;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h1 {
          font-family: Roboto, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
            Arial, sans-serif;
          line-height: 34px;
          font-weight: 400;
          font-style: normal;
          font-size: 28px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h2,
        h3 {
          margin: 0;
          margin: 0;
          font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
            sans-serif;
          font-weight: 400;
          font-style: normal;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h2 {
          line-height: 30px;
          font-size: 24px;
        }
        h3 {
          line-height: 26px;
          font-size: 20px;
        }
        .t8 {
          width: 720px !important;
        }
        .t26 {
          padding: 40px 60px 50px !important;
          width: 680px !important;
        }
        .t11,
        .t15,
        .t24,
        .t32,
        .t36 {
          width: 600px !important;
        }
        .t19 {
          width: 580px !important;
        }
        .t38 {
          padding-left: 0 !important;
          padding-right: 0 !important;
          width: 400px !important;
        }
      }
    </style>
    <style type="text/css" media="screen and (min-width:481px)">
      .moz-text-html img,
      .moz-text-html p {
        margin: 0;
        margin: 0;
        font-family: Fira Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
          Arial, sans-serif;
        line-height: 21px;
        font-weight: 400;
        font-style: normal;
        font-size: 14px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #555;
        text-align: center;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      .moz-text-html h1 {
        margin: 0;
        margin: 0;
        font-family: Roboto, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 34px;
        font-weight: 400;
        font-style: normal;
        font-size: 28px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      .moz-text-html h2 {
        margin: 0;
        margin: 0;
        font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 30px;
        font-weight: 400;
        font-style: normal;
        font-size: 24px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      .moz-text-html h3 {
        margin: 0;
        margin: 0;
        font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
          sans-serif;
        line-height: 26px;
        font-weight: 400;
        font-style: normal;
        font-size: 20px;
        text-decoration: none;
        text-transform: none;
        letter-spacing: 0;
        direction: ltr;
        color: #333;
        text-align: left;
        mso-line-height-rule: exactly;
        mso-text-raise: 2px;
      }
      .moz-text-html .t8 {
        width: 720px !important;
      }
      .moz-text-html .t26 {
        padding: 40px 60px 50px !important;
        width: 680px !important;
      }
      .moz-text-html .t11,
      .moz-text-html .t15 {
        width: 600px !important;
      }
      .moz-text-html .t19 {
        width: 580px !important;
      }
      .moz-text-html .t24 {
        width: 600px !important;
      }
      .moz-text-html .t38 {
        padding-left: 0 !important;
        padding-right: 0 !important;
        width: 400px !important;
      }
      .moz-text-html .t32,
      .moz-text-html .t36 {
        width: 600px !important;
      }
    </style>
    <!--[if !mso]>-->
    <link
      // href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;700&amp;family=Albert+Sans:wght@800&amp;display=swap"
      rel="stylesheet"
      type="text/css"
    />
    <!--<![endif]-->
    <!--[if mso]>
      <style type="text/css">
        img,
        p {
          margin: 0;
          margin: 0;
          font-family: Fira Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
            Arial, sans-serif;
          line-height: 21px;
          font-weight: 400;
          font-style: normal;
          font-size: 14px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #555;
          text-align: center;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h1 {
          margin: 0;
          margin: 0;
          font-family: Roboto, BlinkMacSystemFont, Segoe UI, Helvetica Neue,
            Arial, sans-serif;
          line-height: 34px;
          font-weight: 400;
          font-style: normal;
          font-size: 28px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h2 {
          margin: 0;
          margin: 0;
          font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
            sans-serif;
          line-height: 30px;
          font-weight: 400;
          font-style: normal;
          font-size: 24px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        h3 {
          margin: 0;
          margin: 0;
          font-family: Lato, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial,
            sans-serif;
          line-height: 26px;
          font-weight: 400;
          font-style: normal;
          font-size: 20px;
          text-decoration: none;
          text-transform: none;
          letter-spacing: 0;
          direction: ltr;
          color: #333;
          text-align: left;
          mso-line-height-rule: exactly;
          mso-text-raise: 2px;
        }
        td.t8 {
          width: 800px !important;
        }
        td.t26 {
          padding: 40px 60px 50px !important;
          width: 800px !important;
        }
        td.t11,
        td.t15,
        td.t19,
        td.t24 {
          width: 600px !important;
        }
        td.t38 {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        td.t32,
        td.t36 {
          width: 600px !important;
        }
      </style>
    <![endif]-->
    <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
  </head>
  <body
    id="body"
    class="t43"
    style="
      min-width: 100%;
      margin: 0px;
      padding: 0px;
      background-color: #000000;
    "
  >
    <div class="t42" style="background-color: #000000">
      <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        align="center"
      >
        <tr>
          <td
            class="t41"
            style="
              font-size: 0;
              line-height: 0;
              mso-line-height-rule: exactly;
              background-color: #000000;
            "
            valign="top"
            align="center"
          >
            <!--[if mso]>
              <v:background
                xmlns:v="urn:schemas-microsoft-com:vml"
                fill="true"
                stroke="false"
              >
                <v:fill color="#000000" />
              </v:background>
            <![endif]-->
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              align="center"
              id="innerTable"
            >
              <tr>
                <td>
                  <table
                    class="t4"
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    align="center"
                  >
                    <tr>
                      <!--[if !mso]>-->
                      <td
                        class="t3"
                        style="width: 320px; padding: 40px 40px 40px 40px"
                      >
                        <!--<![endif]-->
                        <!--[if mso]><td class=t3 style="width:400px;padding:40px 40px 40px 40px;"><![endif]-->
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tr>
                            <td>
                              <table
                                class="t2"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td class="t1" style="width: 55px">
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t1 style="width:55px;"><![endif]-->
                                    <div style="font-size: 0px">
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table
                    class="t29"
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    align="center"
                  >
                    <tr>
                      <!--[if !mso]>-->
                      <td
                        class="t28"
                        style="background-color: #ffffff; width: 400px"
                      >
                        <!--<![endif]-->
                        <!--[if mso]><td class=t28 style="background-color:#FFFFFF;width:400px;"><![endif]-->
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tr>
                            <td>
                              <table
                                class="t9"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td
                                    class="t8"
                                    style="
                                      background-color: #ebebeb;
                                      width: 400px;
                                      padding: 40px 40px 40px 40px;
                                    "
                                  >
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t8 style="background-color:#a50034;width:480px;padding:40px 40px 40px 40px;"><![endif]-->
                                    <table
                                      role="presentation"
                                      width="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                    >
                                      <tr>
                                        <td>
                                          <table
                                            class="t7"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t6"
                                                style="width: 200px"
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t6 style="width:200px;"><![endif]-->
                                                <div style="font-size: 0px">
                                                  <img
                                                    class="t5"
                                                    style="
                                                      display: block;
                                                      border: 0;
                                                      height: auto;
                                                      width: 100%;
                                                      margin: 0;
                                                      max-width: 100%;
                                                    "
                                                    width="200"
                                                    height="200"
                                                    alt=""
                                                    src="https://media.us.lg.com/transform/6c7ea0f8-5f94-4fc3-a8fe-18ad05ac2205/lg_logo"
                                                  />
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <table
                                class="t27"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td
                                    class="t26"
                                    style="
                                      width: 420px;
                                      padding: 30px 30px 40px 30px;
                                    "
                                  >
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t26 style="width:480px;padding:30px 30px 40px 30px;"><![endif]-->
                                    <table
                                      role="presentation"
                                      width="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                    >
                                      <tr>
                                        <td>
                                          <table
                                            class="t12"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t11"
                                                style="width: 480px"
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t11 style="width:480px;"><![endif]-->
                                                <h1
                                                  class="t10"
                                                  style="
                                                    margin: 0;
                                                    margin: 0;
                                                    font-family: Albert Sans,
                                                      BlinkMacSystemFont,
                                                      Segoe UI, Helvetica Neue,
                                                      Arial, sans-serif;
                                                    line-height: 35px;
                                                    font-weight: 800;
                                                    font-style: normal;
                                                    font-size: 30px;
                                                    text-decoration: none;
                                                    text-transform: none;
                                                    letter-spacing: -1.2px;
                                                    direction: ltr;
                                                    color: #333333;
                                                    text-align: center;
                                                    mso-line-height-rule: exactly;
                                                    mso-text-raise: 2px;
                                                  "
                                                >
                                                  Thank you for your
                                                  registration
                                                </h1>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <div
                                            class="t13"
                                            style="
                                              mso-line-height-rule: exactly;
                                              mso-line-height-alt: 16px;
                                              line-height: 16px;
                                              font-size: 1px;
                                              display: block;
                                            "
                                          >
                                            &nbsp;
                                          </div>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <table
                                            class="t16"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="left"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t15"
                                                style="width: 480px"
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t15 style="width:480px;"><![endif]-->
                                                <p
                                                  class="t14"
                                                  style="
                                                    margin: 0;
                                                    margin: 0;
                                                    font-family: Inter Tight,
                                                      BlinkMacSystemFont,
                                                      Segoe UI, Helvetica Neue,
                                                      Arial, sans-serif;
                                                    line-height: 21px;
                                                    font-weight: 400;
                                                    font-style: normal;
                                                    font-size: 14px;
                                                    text-decoration: none;
                                                    text-transform: none;
                                                    direction: ltr;
                                                    color: #555555;
                                                    text-align: center;
                                                    mso-line-height-rule: exactly;
                                                    mso-text-raise: 2px;
                                                  "
                                                >
                                                  Click the button below to
                                                  confirm your email address and
                                                  start using your account.
                                                </p>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <div
                                            class="t17"
                                            style="
                                              mso-line-height-rule: exactly;
                                              mso-line-height-alt: 30px;
                                              line-height: 30px;
                                              font-size: 1px;
                                              display: block;
                                            "
                                          >
                                            &nbsp;
                                          </div>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <table
                                            class="t20"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t19"
                                                style="
                                                  background-color: #a50034;
                                                  overflow: hidden;
                                                  width: 460px;
                                                  text-align: center;
                                                  line-height: 24px;
                                                  mso-line-height-rule: exactly;
                                                  mso-text-raise: 2px;
                                                  padding: 10px 10px 10px 10px;
                                                  border-radius: 10px 10px 10px
                                                    10px;
                                                "
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t19 style="background-color:#a50034;overflow:hidden;width:480px;text-align:center;line-height:24px;mso-line-height-rule:exactly;mso-text-raise:2px;padding:10px 10px 10px 10px;border-radius:10px 10px 10px 10px;"><![endif]-->
                                                <div
                                                  class="t18"
                                                  style="
                                                    display: block;
                                                    margin: 0;
                                                    margin: 0;
                                                    font-family: Inter Tight,
                                                      BlinkMacSystemFont,
                                                      Segoe UI, Helvetica Neue,
                                                      Arial, sans-serif;
                                                    line-height: 24px;
                                                    font-weight: 600;
                                                    font-style: normal;
                                                    font-size: 16px;
                                                    text-decoration: none;
                                                    direction: ltr;
                                                    color: #ffffff;
                                                    text-align: center;
                                                    mso-line-height-rule: exactly;
                                                    mso-text-raise: 2px;
                                                  "
                                                  <a
                                                    class="t21"
                                                    href="https://tabular.email"
                                                    style="
                                                      margin: 0;
                                                      margin: 0;
                                                      font-weight: 700;
                                                      font-style: normal;
                                                      text-decoration: none;
                                                      direction: ltr;
                                                      color: #000000;
                                                      mso-line-height-rule: exactly;
                                                    "
                                                    target=""
                                                    ><a
                                                    class="t21"
                                                    href="${confirmLink}"
                                                    style="
                                                      margin: 0;
                                                      margin: 0;
                                                      font-weight: 700;
                                                      font-style: normal;
                                                      text-decoration: none;
                                                      direction: ltr;
                                                      color: #ffffff;
                                                      mso-line-height-rule: exactly;
                                                    "
                                                    target="_blank"
                                                    >Confirm</a
                                                  ></a
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <div
                                            class="t23"
                                            style="
                                              mso-line-height-rule: exactly;
                                              mso-line-height-alt: 12px;
                                              line-height: 12px;
                                              font-size: 1px;
                                              display: block;
                                            "
                                          >
                                            &nbsp;
                                          </div>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <table
                                            class="t25"
                                            role="presentation"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tr>
                                              <!--[if !mso]>-->
                                              <td
                                                class="t24"
                                                style="width: 480px"
                                              >
                                                <!--<![endif]-->
                                                <!--[if mso]><td class=t24 style="width:480px;"><![endif]-->
                                                <p
                                                  class="t22"
                                                  style="
                                                    margin: 0;
                                                    margin: 0;
                                                    font-family: Inter Tight,
                                                      BlinkMacSystemFont,
                                                      Segoe UI, Helvetica Neue,
                                                      Arial, sans-serif;
                                                    line-height: 21px;
                                                    font-weight: 400;
                                                    font-style: normal;
                                                    font-size: 14px;
                                                    text-decoration: none;
                                                    text-transform: none;
                                                    direction: ltr;
                                                    color: #555555;
                                                    text-align: center;
                                                    mso-line-height-rule: exactly;
                                                    mso-text-raise: 2px;
                                                  "
                                                >
                                                  or
                                                  <a
                                                    class="t21"
                                                    href="${login}"
                                                    style="
                                                      margin: 0;
                                                      margin: 0;
                                                      font-weight: 700;
                                                      font-style: normal;
                                                      text-decoration: none;
                                                      direction: ltr;
                                                      color: #000000;
                                                      mso-line-height-rule: exactly;
                                                    "
                                                    target="_blank"
                                                    >log in</a
                                                  >
                                                  to your account
                                                </p>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <div
                    class="t30"
                    style="
                      mso-line-height-rule: exactly;
                      mso-line-height-alt: 30px;
                      line-height: 30px;
                      font-size: 1px;
                      display: block;
                    "
                  >
                    &nbsp;
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <table
                    class="t39"
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    align="center"
                  >
                    <tr>
                      <!--[if !mso]>-->
                      <td
                        class="t38"
                        style="width: 320px; padding: 0 40px 0 40px"
                      >
                        <!--<![endif]-->
                        <!--[if mso]><td class=t38 style="width:400px;padding:0 40px 0 40px;"><![endif]-->
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tr>
                            <td>
                              <table
                                class="t33"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td class="t32" style="width: 480px">
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t32 style="width:480px;"><![endif]-->
                                    <p
                                      class="t31"
                                      style="
                                        margin: 0;
                                        margin: 0;
                                        font-family: Inter Tight,
                                          BlinkMacSystemFont, Segoe UI,
                                          Helvetica Neue, Arial, sans-serif;
                                        line-height: 18px;
                                        font-weight: 400;
                                        font-style: normal;
                                        font-size: 12px;
                                        text-decoration: none;
                                        text-transform: none;
                                        direction: ltr;
                                        color: #555555;
                                        text-align: center;
                                        mso-line-height-rule: exactly;
                                        mso-text-raise: 2px;
                                      "
                                    ></p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div
                                class="t35"
                                style="
                                  mso-line-height-rule: exactly;
                                  mso-line-height-alt: 8px;
                                  line-height: 8px;
                                  font-size: 1px;
                                  display: block;
                                "
                              >
                                &nbsp;
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <table
                                class="t37"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                align="center"
                              >
                                <tr>
                                  <!--[if !mso]>-->
                                  <td class="t36" style="width: 480px">
                                    <!--<![endif]-->
                                    <!--[if mso]><td class=t36 style="width:480px;"><![endif]-->
                                    <p
                                      class="t34"
                                      style="
                                        margin: 0;
                                        margin: 0;
                                        font-family: Inter Tight,
                                          BlinkMacSystemFont, Segoe UI,
                                          Helvetica Neue, Arial, sans-serif;
                                        line-height: 18px;
                                        font-weight: 400;
                                        font-style: normal;
                                        font-size: 12px;
                                        text-decoration: none;
                                        text-transform: none;
                                        direction: ltr;
                                        color: #555555;
                                        text-align: center;
                                        mso-line-height-rule: exactly;
                                        mso-text-raise: 2px;
                                      "
                                    ></p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <div
                    class="t40"
                    style="
                      mso-line-height-rule: exactly;
                      mso-line-height-alt: 100px;
                      line-height: 100px;
                      font-size: 1px;
                      display: block;
                    "
                  >
                    &nbsp;
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
};

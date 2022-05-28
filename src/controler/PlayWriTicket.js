import { chromium } from 'playwright';


class TicketsAverias {
  constructor(
    // id,
    id_comunidad,
    id_user,
    id_pass,
    // fecha_creacion,
    // fecha_modificacion,
    // fecha_estado,
    // fecha_inicio,
    // fecha_fin,
    // descripcion,
    // observaciones,
    // id_tipo_averia,
    // id_falla_tipo_averia,
    // codigo_req_cliente,
    // nombre_cliente,
    // contrato,
    // direccion_instalacion,
    // codigo_distrito,
    // nombre_distrito,
    // nodo,
    // troba,
    // tipo_actuacion,
    // tipo_averia,
    // descripcion_actuacion,
    // observacion_actuacion,
    // estado_averia,
    // fecha_registro,
    // fecha_actualizacion,
    // latitud,
    // longitud,
    // altura_disponible,
    // velocidad_actuacion,
    // tipo_cliente,
    // falla_reportada_por,
    // codigo_motivo,
    // descripcion_motivo,
    // observaciones_generales,
    // observaciones_tecnicas,
    // estado_ticket,
    // fecha_estado_ticket,
    // id_usuario_asignado,
    // id_usuario_cierre,
    // id_usuario_ultima_actualizacion,
    // id_usuario_registro, id_usuario_modificacion, id_usuario_ultima_modificacion, id_usuario_validacion, id_usuario_validacion_cierre, id_usuario_validacion_cierre_final, id_usuario_validacion_cierre_final_final, id_usuario_validacion_cierre_final_final_final, id_usuario_validacion_cierre_final_final_final_final, id_usuario_validacion_cierre_final_final_final_final_final, id_usuario_validacion_cierre_final_final_final_final_final_final,
    // id_usuario_validacion_cierre_final_final_final_final_final_final_final, id_usuario_validacion_cierre_final_final_,)
  ) {
    this.id_comunidad = id_comunidad;
    this.id_user = id_user;
    this.id_pass = id_pass;
  }
  async loginPageScraping() {
    return new Promise(async (resolve, reject) => {
      try {
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({
          viewport: null,
          ignoreHTTPSErrors: true
        });
        const page = await context.newPage();
        await page.goto('http://otrs.dosniha.eu/osticket/scp/login.php');
        await page.fill('[placeholder="e-mail o nombre de usuario"]', `${this.id_user}`);
        await page.fill('[placeholder="Contraseña"]', `${this.id_pass}`);
        await Promise.all([
          page.waitForNavigation('http://otrs.dosniha.eu/osticket/scp/index.php'),
          page.click('text=Inicia sesión')
        ]);
        resolve([page, browser]);
      } catch (error) {
        reject(error);
      }
    });
  };
  async listFauls(page) {
    return new Promise(async (resolve, reject) => {
      try {
        // const list = await page.$$('.list>tbody>tr');
        // const page = await page;
        await page.waitForSelector('.list');
        const data = await page.evaluate(() => {
          const table = document.querySelector('.list');
          const rows = [...table.querySelectorAll('tbody>tr')];
          const data = rows.map(row => {
            const td = [...row.querySelectorAll('td')];
            let id = td[1].innerText;
            let subject = td[2].innerText;
            let from = td[3].innerText;
            let date = td[6].innerText;
            let state = td[7].innerText;
            return { id, subject, from, date, state };
          });
          return data;
        });
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getTicketDetails(page, id) {
    let estadoMaquina, dineroPendiente, message;
    await page.waitForNavigation();
    return new Promise(async (resolve, reject) => {
      try {
        dineroPendiente = await page.evaluate(() => {
          const table = document.querySelector('table.ticket_info:nth-child(7)');
          const rows = [...table.querySelectorAll('tbody>tr')];
          const data = rows.map(row => {
            const td = [...row.querySelectorAll('td')];
            let key = td[0].innerText;
            let value = td[1].innerText;
            return { key, value };
          })
          return data;
        });
        estadoMaquina = await page.evaluate(() => {
          const table = document.querySelector('table.ticket_info:nth-child(8)');
          const rows = [...table.querySelectorAll('tbody>tr')] || [];
          const data = rows.map(row => {
            const td = [...row.querySelectorAll('td')];
            let key = td[0].innerText;
            let value = td[1].innerText;
            return { key, value };
          })
          return data;
        });
        message = await page.evaluate(() => {
          const messa = document.querySelector('.thread-body');
          const message = messa.innerText;;
          return message;
        });
        resolve({ estadoMaquina, dineroPendiente, message });
      } catch (error) {
        reject(error);
      }
    });

  }
}




export default TicketsAverias;
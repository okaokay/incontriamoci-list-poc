/* ============================================================================
   LIST — jQuery Plugin ($.fn.listItem)
   Stesso trattamento della card TopList (vedi POC "incontriamoci-toplist-
   card-poc"): questo file NON genera l'HTML degli elementi lista — il
   markup ESISTE GIÀ nella pagina, scritto a mano qui nel POC, stampato da
   Blade in produzione (vedi il commento "QUESTO È IL CONTRATTO HTML PER
   BLADE" in cima a index.html). Il plugin si limita ad agganciare
   l'unica interattività prevista da questo componente: il toggle del
   cuoricino preferiti.

   File autonomo, dipende solo da jQuery.
   ============================================================================ */

(function ($) {
  "use strict";

  var PLUGIN_NAME = "listItem";

  /* Contatore per generare un id INTERNO univoco per ogni istanza, usato
     per namespacizzare gli eventi delegati — stesso identico motivo (e
     stessa soluzione) del plugin vetrineSlider/toplistCard: senza,
     destroy() su un'istanza rischierebbe di togliere gli event handler
     anche di un'altra lista List presente sulla stessa pagina. */
  var instanceCounter = 0;

  function Plugin(element) {
    var self = this;
    self.element = element;
    self.$root = $(element);
    self.instanceId = PLUGIN_NAME + "-" + (++instanceCounter);
    self.init();
  }

  $.extend(Plugin.prototype, {

    init: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;
      var ns = "." + self.instanceId;

      /* Toggle cuoricino preferiti: SOLO una classe CSS ("is-active") a
         cambiare — stesso stato SOLO visivo/locale al browser già visto
         nella card TopList (non persiste al reload, non chiama nessun
         endpoint; la vera persistenza del "preferito" è lato Laravel,
         fuori scope per questo POC).

         Ogni annuncio esiste in DUE copie nel DOM (template desktop +
         template mobile/tablet, una sola visibile alla volta via CSS):
         aggiorniamo QUINDI tutti i cuoricini con lo stesso
         "data-listing-id" (non solo quello cliccato), così lo stato resta
         sincronizzato anche ridimensionando la finestra da mobile a
         desktop o viceversa — stesso identico comportamento della card
         TopList. */
      self.$root.on("click" + ns, ".list-item__favorite, .list-item-mobile__favorite", function () {
        var $clicked = $(this);
        var nextActive = !$clicked.hasClass("is-active");
        var listingId = $clicked.closest("[data-listing-id]").data("listing-id");

        self.$root
          .find('[data-listing-id="' + listingId + '"]')
          .find(".list-item__favorite, .list-item-mobile__favorite")
          .toggleClass("is-active", nextActive)
          .attr("aria-pressed", String(nextActive));
      });
    },

    /* --------------------------------------------------------------------
       DISTRUZIONE DELL'ISTANZA
       Toglie SOLO gli eventi di QUESTA istanza (grazie al namespace
       per-istanza) — sicuro da chiamare anche con più liste List attive
       sulla stessa pagina. */
    destroy: function () {
      this.$root.off("." + this.instanceId);
      $.removeData(this.element, PLUGIN_NAME);
    }
  });

  /* --------------------------------------------------------------------
     DEFINIZIONE PLUGIN JQUERY — $.fn.listItem
     Stesso pattern di vetrineSlider/toplistCard: prima chiamata su un
     elemento = crea l'istanza; chiamate successive con una stringa =
     invocano il metodo pubblico corrispondente. Esempi:

         $("#listSection").listItem();
         $("#listSection").listItem("destroy");
     -------------------------------------------------------------------- */
  $.fn[PLUGIN_NAME] = function (options) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      var instance = $.data(this, PLUGIN_NAME);

      if (!instance) {
        $.data(this, PLUGIN_NAME, new Plugin(this));
      } else if (typeof options === "string" && options.charAt(0) !== "_" && typeof instance[options] === "function") {
        instance[options].apply(instance, args);
      } else {
        $.error("Il metodo '" + options + "' non esiste nel plugin " + PLUGIN_NAME + ".");
      }
    });
  };

  /* --------------------------------------------------------------------
     INIZIALIZZAZIONE AL CARICAMENTO DELLA PAGINA
     Aggancia il plugin al contenitore della lista, già popolato da Blade
     (o, in questo POC, scritto a mano in index.html). */
  $(function () {
    $("#listSection").listItem();
  });

})(jQuery);

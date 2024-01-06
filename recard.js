/**
 * Card that allows reusing cards in other views.
 * 
 * For example a complex vertical stacks cards from living-room, bedroom views
 * can be reused in big-screen view that aggregates multiple rooms into one big screen.
 * 
 * Configuration example:
 * type: custom:re-card
 * viewPath: living-room    # Path of the view
 * cardIndex: 0             # Card index in that view
 */
const helpers = await loadCardHelpers();

class ReCard extends HTMLElement {
  _computeCardSize(card) {
    if (typeof card.getCardSize === "function") {
      return card.getCardSize();
    }
    if (customElements.get(card.localName)) {
      return 1;
    }
    return customElements
      .whenDefined(card.localName)
      .then(() => this._computeCardSize(card));
  };

  get _configToReuse() {
    const { viewPath, cardIndex } = this._config;
    const views = this._getLovelace().config.views;
    const view = views && views.find(v => v.path === viewPath);
    if (!view) {
      throw new Error("No view with such path found");
    }
    const card = view.cards[cardIndex];
    if (!card) {
      throw new Error("No card with such index found");
    }
    return card;
  }

  _getLovelace() {
    let root = document.querySelector('home-assistant');
    root = root && root.shadowRoot;
    root = root && root.querySelector('home-assistant-main');
    root = root && root.shadowRoot;
    root = root && root.querySelector('app-drawer-layout partial-panel-resolver') || root;
    root = root && root.shadowRoot || root;
    root = root && root.querySelector('ha-panel-lovelace');
    root = root && root.shadowRoot;
    root = root && root.querySelector('hui-root');
    if (root) {
      return root.lovelace;
    }
    return null;
  }

  _renderCard() {
    this._card = helpers.createCardElement(this._configToReuse);
    this.innerHTML = "";
    this.appendChild(this._card);
    this._card.hass = this._hass;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._card) {
      this._renderCard();
    } else {
      this._card.hass = this._hass;
    }
  }

  setConfig(config) {
    if (!config.viewPath) {
      throw new Error("You need to define an viewPath");
    }
    if (config.cardIndex === undefined) {
      throw new Error("You need to define an cardIndex");
    }
    this._config = config;
    this._renderCard();
  }

  getCardSize() {
    return this._computeCardSize(this._card);
  }
}

customElements.define("re-card", ReCard);
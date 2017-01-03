Ext.define('FV.controller.Articles', {
    extend: 'Ext.app.Controller',

    stores: ['Articles'],

    models: ['Article'],

    views: ['article.Grid', 'article.Preview'],

    refs: [{
        ref: 'feedShow',
        selector: 'feedshow'
    }, {
    	ref: 'viewer',
    	selector: 'viewer'
    }, {
    	ref: 'articlePreview',
    	selector: 'articlepreview'
    }, {
        ref: 'articleTab',
        xtype: 'articlepreview',
        closable: true,
        forceCreate: true,
        selector: 'articlepreview'
    }],

    init: function() {
        this.control({
            'articlegrid': {
                selectionchange: this.previewArticle
            },
            'articlegrid > tableview': {
                itemdblclick: this.loadArticle,
                refresh: this.selectArticle
            },
            'articlegrid button[action=openall]': {
                click: this.openAllArticles
            },
            'articlepreview button[action=viewintab]': {
                click: this.viewArticle
            },
            'articlepreview button[action=gotopost]': {
                click: this.openArticle
            }
        });
    },

    selectArticle: function(view) {
        var first = this.getArticlesStore().getAt(0);
        if (first) {
            view.getSelectionModel().select(first);
        }
    },

    /**
     * Loads the given article into the preview panel
     * @param {FV.model.Article} article The article to load
     */
    previewArticle: function(grid, articles) {
        var article = articles[0],
            articlePreview = this.getArticlePreview();

        if (article) {
            articlePreview.article = article;
    		articlePreview.update(article.data);
        }
    },

    openArticle: function(btn) {
        window.open(btn.up('articlepreview').article.get('link'));
    },
    
    openAllArticles: function() {
        this.loadArticles(this.getArticlesStore().getRange());
    },

    viewArticle: function(btn) {
        this.loadArticle(null, btn.up('articlepreview').article);
    },
    
    loadArticles: function(articles){
        var viewer = this.getViewer(),
            toAdd = [],
            id;
            
        Ext.Array.forEach(articles, function(article){
            id = article.id;
            if (!viewer.down('[articleId=' + id + ']')) {
                tab = this.getArticleTab();
                tab.down('button[action=viewintab]').destroy();
                tab.setTitle(article.get('title'));
                tab.article = article;
                tab.articleId = id;
                tab.update(article.data);
                toAdd.push(tab);
            }
        }, this);
        viewer.add(toAdd);
    },

    /**
     * Loads the given article into a new tab
     * @param {FV.model.Article} article The article to load into a new tab
     */
    loadArticle: function(view, article) {
        var viewer = this.getViewer(),
            title = article.get('title'),
            articleId = article.id;
            
        tab = viewer.down('[articleId=' + articleId + ']');
        if (!tab) {
            tab = this.getArticleTab();
            tab.down('button[action=viewintab]').destroy();
        }

        tab.setTitle(title);
        tab.article = article;
        tab.articleId = articleId;
        tab.update(article.data);

        viewer.add(tab);
        viewer.setActiveTab(tab);            
        
        return tab;
    }
});

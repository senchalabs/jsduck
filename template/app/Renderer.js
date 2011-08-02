/**
 * Renders the whole class-documentation page.
 */
Ext.define('Docs.Renderer', {
    /**
     * Renders class object into HTML documentation.
     * @param {Object} cls Class documentation object.
     * @return {String} HTML
     */
    render: function(cls) {
        this.cls = cls;

        this.classTpl = this.classTpl || new Ext.XTemplate(
            '<div>',
                '{hierarchy}',
                '<div class="doc-contents">',
                    '{doc}',
                '</div>',
                '<div class="members">',
                    '{members}',
                '</div>',
            '</div>'
        );

        return this.classTpl.apply({
            doc: cls.doc,
            hierarchy: this.renderHierarchy(cls),
            members: this.renderMembers(cls)
        });
    },

    renderHierarchy: function(cls) {
        if (!(cls["extends"] && cls["extends"] !== "Object") &&
            cls.superclasses.length === 0 &&
            cls.allMixins.length === 0 &&
            cls.alternateClassNames.length === 0
        ) {
            return "";
        }

        this.hierarchyTpl = this.hierarchyTpl || new Ext.XTemplate(
            '<pre class="hierarchy">',
            '<tpl if="alternateClassNames.length &gt; 0">',
                '<h4>Alternate names</h4>',
                '<tpl for="alternateClassNames">',
                    '<div class="alternate-class-name">{.}</div>',
                '</tpl>',
            '</tpl>',
            '<tpl if="tree">',
                '<h4>Hierarchy</h4>',
                '{tree}',
            '</tpl>',
            '<tpl if="mixins.length &gt; 0">',
                '<h4>Mixins</h4>',
                '<tpl for="mixins">',
                    '<div class="mixin">{.}</div>',
                '</tpl>',
            '</tpl>',
            '</pre>'
        );

        return this.hierarchyTpl.apply({
            tree: this.renderTree(cls),
            mixins: Ext.Array.map(cls.allMixins, this.renderLink, this),
            alternateClassNames: cls.alternateClassNames
        });
    },

    // Take care of the special case where class has parent for which we have no docs.
    // In that case the "extends" property exists but "superclasses" is empty.
    // We still create the tree, but without links in it.
    renderTree: function(cls) {
        if (cls.superclasses.length) {
            return this.renderClassTree(cls.superclasses.concat(cls.name), {first: true, links: true});
        }
        else if (cls["extends"] && cls["extends"] !== "Object") {
            return this.renderClassTree([cls["extends"], cls.name], {first: true});
        }
        else {
            return "";
        }
    },

    renderClassTree: function(superclasses, o) {
        if (superclasses.length === 0) {
            return "";
        }

        this.classTreeTpl = this.classTreeTpl || new Ext.XTemplate(
            '<div class="subclass {firstChild}">',
              '{link}',
              '{subtree}',
            '</div>'
        );

        var name = superclasses[0];
        return this.classTreeTpl.apply({
            firstChild: o.first ? 'first-child' : '',
            link: superclasses.length > 1 ? (o.links ? this.renderLink(name) : name) : '<strong>'+name+'</strong>',
            subtree: this.renderClassTree(superclasses.slice(1), {links: o.links})
        });
    },

    renderLink: function(className) {
        return Ext.String.format('<a href="#/api/{0}" rel="{0}" class="docClass">{0}</a>', className);
    },

    renderMembers: function(cls) {
        var sections = [
            {type: "cfg", title: "Config options"},
            {type: "property", title: "Properties"},
            {type: "method", title: "Methods"},
            {type: "event", title: "Events"}
        ];

        // Skip rendering empty sections
        return Ext.Array.map(sections, function(sec) {
            var members = cls.members[sec.type];
            var statics = cls.statics[sec.type];
            return (members.length > 0 || statics.length > 0) ? this.renderSection(members, statics, sec) : "";
        }, this).join("");
    },

    renderSection: function(members, statics, section) {
        this.sectionTpl = this.sectionTpl || new Ext.XTemplate(
            '<div id="m-{type}">',
                '<tpl if="!statics.length">',
                    '<div class="definedBy">Defined By</div>',
                '</tpl>',
                '<h3 class="members-title">{title}</h3>',
                '<tpl if="members.length">',
                    '<div class="subsection">',
                        '<tpl if="statics.length">',
                            '<div class="definedBy">Defined By</div>',
                            '<h4 class="members-subtitle">Instance {title}</h3>',
                        '</tpl>',
                        '{members}',
                    '</div>',
                '</tpl>',
                '<tpl if="statics.length">',
                    '<div class="subsection">',
                        '<div class="definedBy">Defined By</div>',
                        '<h4 class="members-subtitle">Static {title}</h3>',
                        '{statics}',
                    '</div>',
                '</tpl>',
            '</div>'
        );

        return this.sectionTpl.apply({
            type: section.type,
            title: section.title,
            members: Ext.Array.map(members, this.renderMemberDiv, this).join(""),
            statics: Ext.Array.map(statics, this.renderMemberDiv, this).join("")
        });
    },

    renderMemberDiv: function(member, index) {
        this.memberTpl = this.memberTpl || new Ext.XTemplate(
            '<div id="{tagname}-{name}" class="member {firstChild} {inherited}">',
                // leftmost column: expand button
                '<a href="#" class="side {expandable}">',
                    '<span>&nbsp;</span>',
                '</a>',
                // member name and type + link to owner class and source
                '<div class="title">',
                    '<div class="meta">',
                        '<a href="#/api/{owner}" rel="{owner}" class="definedIn docClass">{owner}</a><br/>',
                        '<a href="source/{href}" target="_blank" class="viewSource">view source</a>',
                    '</div>',
                    '{signature}',
                '</div>',
                // short and long descriptions
                '<div class="description">',
                    '<div class="short">{[this.shortDoc(values)]}</div>',
                    '<div class="long">{longDoc}</div>',
                '</div>',
            '</div>',
            {
                // Returns contents for short documentation
                shortDoc: function(cfg) {
                    return cfg.shortDoc ? cfg.shortDoc : cfg.doc;
                }
            }
        );

        return this.memberTpl.apply(Ext.apply({
            // use classname "first-child" when it's first member in its category
            firstChild: (index === 0) ? "first-child" : "",
            // use classname "expandable" when member has shortened description
            expandable: member.shortDoc ? "expandable" : "not-expandable",
            // use classname "inherited" when member is not defined in this class
            inherited: member.owner === this.cls.name ? "not-inherited" : "inherited",
            // method params signature or property type signature
            signature: this.renderSignature(member),
            // full documentation together with optional parameters and return value
            longDoc: this.renderLongDoc(member)
        }, member));
    },

    renderSignature: function(member) {
        this.signatureTpl = this.signatureTpl || new Ext.XTemplate(
            '{before}<a href="#/api/{owner}-{tagname}-{name}" class="name {expandable}">{name}</a>{params}{after}'
        );

        var cfg = Ext.apply({}, member);
        cfg.expandable = member.shortDoc ? "expandable" : "not-expandable";

        if (member.tagname === "method" && member.name === "constructor") {
            cfg.before = "<strong class='constructor-signature'>new</strong>";
            cfg.name = this.cls.name;
        }

        if (member.tagname === "cfg" || member.tagname === "property") {
            cfg.params = "<span> : " + member.type + "</span>";
        }
        else {
            var ps = Ext.Array.map(member.params, this.renderShortParam, this).join(", ");
            cfg.params = '( <span class="pre">' + ps + "</span> )";
            if (member.tagname === "method" && member["return"].type !== "undefined") {
                cfg.params += " : " + member["return"].type;
            }
        }

        cfg.after = "";
        if (member['protected']) {
            cfg.after += "<strong class='protected-signature'>protected</strong>";
        }
        if (member['static']) {
            cfg.after += "<strong class='static-signature'>static</strong>";
        }
        if (member.deprecated) {
            cfg.after += "<strong class='deprecated-signature'>deprecated</strong>";
        }
        if (member.tagname === "cfg" && !member.optional) {
            cfg.after += "<strong class='required-signature'>required</strong>";
        }

        return this.signatureTpl.apply(cfg);
    },

    renderShortParam: function(param) {
        var p = param.type + " " + param.name;
        return param.optional ? "["+p+"]" : p;
    },

    renderLongDoc: function(member) {
        var doc = member.doc;

        if (member["default"]) {
            doc += "<p>Defaults to: <code>" + Ext.String.htmlEncode(member["default"]) + "</code></p>";
        }

        if (member.deprecated) {
            var v = member.deprecated.version ? "since " + member.deprecated.version : "";
            doc += '<div class="deprecated">';
            doc += Ext.String.format('<p>This {0} has been <strong>deprecated</strong> {1}</p>', member.tagname, v);
            doc += member.deprecated.text;
            doc += '</div>';
        }
        
        doc += this.renderParamsAndReturn(member);

        return doc;
    },

    // Handles both rendering of method parameters and return value.
    // Plus the rendering of object properties, which could also be
    // functions in which case they too will be rendered with
    // parameters and return value.
    renderParamsAndReturn: function(item) {
        var doc = "";
        var params, ret;

        if (item.params && item.params.length > 0) {
            params = item.params;
        }
        else if (item.properties && item.properties.length > 0) {
            params = item.properties;
            // If the name of last property is "return"
            // remove it from params list and handle it separately afterwards
            if (params[params.length-1].name === "return") {
                ret = params[params.length-1];
                params = params.slice(0, params.length-1);
            }
        }

        if (params) {
            if (item.type === "Function" || item.tagname === "method" || item.tagname === "event") {
                doc += '<h3 class="pa">Parameters</h3>';
            }
            doc += "<ul>" + Ext.Array.map(params, this.renderLongParam, this).join("") + "</ul>";
        }

        if (item["return"]) {
            doc += this.renderReturn(item["return"]);
        }
        else if (ret) {
            doc += this.renderReturn(ret);
        }

        return doc;
    },

    renderLongParam: function(param) {
        this.paramTpl = this.paramTpl || new Ext.XTemplate(
            '<li>',
                '<span class="pre">{name}</span> : {type}',
                '<tpl if="optional"> (optional)</tpl>',
                '<div class="sub-desc">',
                    '{doc}',
                    '<tpl if="values[&quot;default&quot;]">',
                        '<p>Defaults to: <code>{[Ext.String.htmlEncode(values["default"])]}</code></p>',
                    '</tpl>',
                    '<tpl if="properties && properties.length">',
                        '{[this.renderParamsAndReturn(values)]}',
                    '</tpl>',
                '</div>',
            '</li>',
            {
                renderParamsAndReturn: Ext.Function.bind(this.renderParamsAndReturn, this)
            }
        );

        return this.paramTpl.apply(param);
    },

    renderReturn: function(returnDoc) {
        this.returnTpl = this.returnTpl || new Ext.XTemplate(
            '<h3 class="pa">Returns</h3>',
            '<ul>',
                '<li>',
                    '<span class="pre">{type}</span>',
                    '<div class="sub-desc">',
                        '{doc}',
                        '<tpl if="properties && properties.length">',
                            '{[this.renderParamsAndReturn(values)]}',
                        '</tpl>',
                    '</div>',
                '</li>',
            '</ul>',
            {
                renderParamsAndReturn: Ext.Function.bind(this.renderParamsAndReturn, this)
            }
        );

        return this.returnTpl.apply(returnDoc);
    }
});

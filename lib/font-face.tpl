@font-face {
    font-family: "<%=fontFamily%>";
    font-style: normal;
    font-weight: normal;
    src: <%if (local) {%>local("<%=local%>"), <%}%><% if (base64) { %> url(<%=base64%>) format("truetype"), <% } else { %> url("<%=fontPath%><%=fontFile%>.woff2") format("woff2"), url("<%=fontPath%><%=fontFile%>.woff") format("woff"), url("<%=fontPath%><%=fontFile%>.ttf") format("truetype"); <% } %>
}

<% if (glyph) { %>
[class^="<%=iconPrefix%>-"],
[class*=" <%=iconPrefix%>-"]:after {
    font-family: "<%=fontFamily%>";
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

<% _.each(glyfList, function(glyf) { %>
.<%=iconPrefix%>-<%=glyf.name%>:before {
    content: "<%=glyf.codeName%>";
}
<% }); %>
<% }; %>

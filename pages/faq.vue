<template>
  <section class="content section container">
    <h1>tinyPaste FAQ</h1>
    <p>Article publishing platform with encryption and markdown support.</p>
    <h5>What of the Markdown features can I use?</h5>
    <p>All of the <a href="https://www.markdownguide.org/basic-syntax/">CommonMark</a> features and some <a href="https://www.markdownguide.org/extended-syntax/">extended syntax</a> features excluding emojies, definition lists and footnotes.</p>
    <p>Also you can use <a href="https://katex.org/docs/supported.html">Math:</a></p>
    <pre><code>```math
\begin{aligned}
  a&=b+c \\
  d+e&=f
\end{aligned}
```</code></pre>
  <pre><code>`$a = b + c$`</code></pre>
  <h5>Which languages support syntax highlighting?</h5>
  <p>See list <a href="https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md">here</a></p>
  </section>
</template>

<script>
export default {
  
}
</script>

<style lang="scss">
code {
  font-family: 'FiraCode', monospace;
}

.content pre {
  padding: .7rem
}
</style>
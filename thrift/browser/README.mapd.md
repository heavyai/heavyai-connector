Note that `thrift/browser/thrift.js` contains the following patch
due to poor performance for large arrays in V8/Chrome.

This patch has been submitted to Thrift and is awaiting approval
as of 6/27/18. Once merged we can upgrade to the current Thrift release
and remove this readme.

https://issues.apache.org/jira/browse/THRIFT-4592
https://github.com/apache/thrift/pull/1569

```
diff --git a/thrift/browser/thrift.js b/thrift/browser/thrift.js
index fada9ba..517f372 100644
--- a/thrift/browser/thrift.js
+++ b/thrift/browser/thrift.js
@@ -1266,7 +1266,11 @@ Thrift.Protocol.prototype = {
             if (f.length === 0) {
                 r.value = undefined;
             } else {
-                r.value = f.shift();
+                if (!f.isReversed) {
+                    f.reverse();
+                    f.isReversed = true;
+                }
+                r.value = f.pop();
             }
         } else if (f instanceof Object) {
            for (var i in f) {
```

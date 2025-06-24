trace
- pass
    - rewrites 

# eg

== trace ==
- cse 
    - elim
    - elim 
- strength reduce
    - rewrite 
    - rewrite
- arith to llvm
    - rewrite
    - rewrite
    - rewrite

#### features
- filter the trace?
- disambiguate CSE operations 
- profiling
    - "canonical cost" -> remove the cost of CSE that is duplicated everywhere
- debugging
    - research into LLDB, breakpoint through a linear algebra func and visualize it
    - natvis for mlir types?
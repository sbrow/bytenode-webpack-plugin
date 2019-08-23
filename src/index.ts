import { basename, dirname, join } from "path";
import { Compiler, Configuration, Plugin, SingleEntryPlugin } from "webpack";
import VirtualModulesPlugin from "webpack-virtual-modules";
import ExternalsPlugin from "webpack/lib/ExternalsPlugin";
import NodeTargetPlugin from "webpack/lib/node/NodeTargetPlugin";

export interface Options {
    entries: string | { [name: string]: string };
    external?: boolean;
}

export class BytenodePlugin implements Plugin {
    public entries: Options["entries"];
    public external: Options["external"];

    constructor({ entries, external }: Options) {
        if (typeof entries === "string") {
            this.entries = {};
            this.entries[basename(entries).replace(/\..*$/, "")] = entries;
        } else if (typeof entries === "object") {
            this.entries = entries;
        } else {
            throw new Error("entries not valid");
        }
        this.external = external === true;
    }

    public apply(compiler: Compiler): void {
        this.createStub(compiler);

        compiler.hooks.entryOption.tap(
            BytenodePlugin.name,
            (context, entry) => {
                for (const name of Object.keys(entry)) {
                    if (name in this.entries) {
                        const newName = this.entries[name];
                        entry[newName] = entry[name];
                        delete entry[name];
                    }
                }
            },
        );
        compiler.hooks.make.tapAsync(BytenodePlugin.name, (compilation, cb) => {
            for (const entry of Object.keys(this.entries)) {
                const value = this.entries[entry];
                if (value in compiler.options.entry) {
                    const childOptions: Configuration = {
                        ...compiler.options,
                        entry: {},
                        externals:
                            this.external === true
                                ? { bytenode: "commonjs bytenode" }
                                : {},
                    };
                    childOptions.entry[entry] = join(
                        dirname(compiler.options.entry[value]),
                        `${value}.js`,
                    );
                    childOptions.externals[
                        `./${entry}`
                    ] = `commonjs ./${this.entries[entry]}`;
                    const child: Compiler = compilation.createChildCompiler(
                        BytenodePlugin.name,
                        childOptions,
                    );
                    child.context = compiler.context;
                    this.applyPlugins(childOptions, child);

                    const [name] = Object.keys(childOptions.entry);
                    const file = childOptions.entry[name];
                    new SingleEntryPlugin(compiler.context, file, name).apply(
                        child,
                    );
                    child.runAsChild((err, entries, childCompilation) => {
                        if (err !== null) {
                            cb(err);
                        } else {
                            cb();
                        }
                    });
                }
            }
        });
    }

    private applyPlugins(
        options: Configuration,
        childCompiler: Compiler,
    ): void {
        // child.options = new WebpackOptionsApply().process(
        //     childOptions,
        //     child,
        // );
        new NodeTargetPlugin().apply(childCompiler);
        if (options.output) {
            new ExternalsPlugin(
                options.output.libraryTarget || "commonjs",
                options.externals,
            ).apply(childCompiler);
        }
    }

    private createStub(parentCompiler: Compiler): void {
        if (parentCompiler.options.entry) {
            const modules: { [path: string]: string } = {};
            for (const entry of Object.keys(this.entries)) {
                if (entry in parentCompiler.options.entry) {
                    const moduleName = join(
                        dirname(parentCompiler.options.entry[entry]),
                        `${
                            this.entries[entry] // @todo make js.
                        }.js`,
                    );
                    modules[
                        moduleName
                    ] = `require("bytenode");require("./${entry}")`;
                }
            }
            new VirtualModulesPlugin(modules).apply(parentCompiler);
        }
    }
}

export default BytenodePlugin;

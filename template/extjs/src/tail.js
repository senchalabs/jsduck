//@tail

/*
 * This file represents the very last stage of the Ext definition process and is ensured
 * to be included at the end of the build via the 'tail' package of extjs.jsb3.
 *
 */

Ext._endTime = new Date().getTime();
if (Ext._beforereadyhandler){
    Ext._beforereadyhandler();
}